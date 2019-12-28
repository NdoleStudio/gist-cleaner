package handler

import (
	"bytes"
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/pusher/pusher-http-go"
)


// APIVersion represents the version of the API
const APIVersion = "v1"

// JSONContentType string value for the json content type
const JSONContentType = "application/json"

// DashboardDataQuery GraphQl query to provide the dashboard data
const DashboardDataQuery = "{\"query\": \"query {viewer{login id bio avatarUrl url name gists(first:50,privacy:ALL,orderBy:{field:CREATED_AT,direction:DESC}){edges{node{id files{name} description url updatedAt name isPublic}}}}}\"}"

// EventGistDeleted event raised when a gist is deleted
const EventGistDeleted = "gist-deleted"

// EventAllGistsDeleted event raised when all gists have been deleted
const EventAllGistsDeleted = "all-gists-deleted"

// PathDashboard path to the dashboard api resource
const PathDashboard = "/dashboard"

// PathDelete path to the delete resource
const PathDelete = "/delete"

// GistProfileBasePath path to the github gist
const GistProfileBasePath = "https://gist.github.com/"


type accessTokenResponse struct {
	AccessToken string `json:"access_token"`
}

type dashboardRequest struct {
	Code        string `json:"code"`
	AccessToken string `json:"access_token"`
}

type deleteRequest struct {
	AccessToken string `json:"access_token"`
	ID          string `json:"id"`
	Gists       []struct {
		ID       string `json:"id"`
		FileName string `json:"file_name"`
	} `json:"gists"`
}

type dashboardData struct {
	Data struct {
		Viewer struct {
			Login     string `json:"login"`
			Bio       string `json:"bio"`
			ID        string `json:"id"`
			AvatarURL string `json:"avatarUrl"`
			URL       string `json:"url"`
			Name      string `json:"name"`
			Gists     struct {
				Edges []struct {
					Node struct {
						ID    string `json:"id"`
						Files []struct {
							Name string `json:"name"`
						} `json:"files"`
						Description string    `json:"description"`
						URL         string    `json:"url"`
						UpdatedAt   time.Time `json:"updatedAt"`
						Name        string    `json:"name"`
						IsPublic    bool      `json:"isPublic"`
					} `json:"node"`
				} `json:"edges"`
			} `json:"gists"`
		} `json:"viewer"`
	} `json:"data"`
}

type hashMap map[string]interface{}

func handleCatchAll(responseWriter http.ResponseWriter, request *http.Request) {
	responseObject := map[string]interface{}{
		"apiVersion": APIVersion,
		"url":        request.URL.String(),
	}

	writeResponseObject(responseWriter, responseObject)
}

func handleDelete(responseWriter http.ResponseWriter, request *http.Request) {
	var deleteRequest deleteRequest
	decodeJSON(&deleteRequest, request.Body)

	pusherClient := createPusherClient()

	var waitGroup sync.WaitGroup
	for index := range deleteRequest.Gists {
		waitGroup.Add(1)
		go func(index int) {
			gist := deleteRequest.Gists[index]

			deleteURL := os.Getenv("GITHUB_REST_API_ENDPOINT") + "/gists/" + gist.ID
			apiRequest := createDeleteRequest(deleteURL, deleteRequest.AccessToken)
			apiResponse := doHTTPRequest(apiRequest)

			if apiResponse.StatusCode == http.StatusNoContent {
				sendPusherTrigger(
					pusherClient,
					deleteRequest.ID,
					EventGistDeleted,
					map[string]string{
						"file_name": gist.FileName,
					},
				)
			}

			waitGroup.Done()
		}(index)
	}

	waitGroup.Wait()

	sendPusherTrigger(pusherClient, deleteRequest.ID, EventAllGistsDeleted, nil)

	writeResponseObject(responseWriter, map[string]interface{}{})
}

func handleDashboard(responseWriter http.ResponseWriter, request *http.Request) {
	var dashboardRequest dashboardRequest
	decodeJSON(&dashboardRequest, request.Body)

	accessToken := dashboardRequest.AccessToken

	if accessToken == "" {
		accessToken = getAccessTokenFromCode(dashboardRequest.Code)
	}

	apiRequest := createGraphQlRequest(os.Getenv("GITHUB_GRAPHQL_API"), DashboardDataQuery, accessToken)
	apiResponse := doHTTPRequest(apiRequest)

	var apiResponseData dashboardData
	decodeJSON(&apiResponseData, apiResponse.Body)

	dashboardDataObject := map[string]interface{}{
		"access_token":  accessToken,
		"is_successful": apiResponseData.Data.Viewer.ID != "",
		"id":            apiResponseData.Data.Viewer.ID,
		"username":      apiResponseData.Data.Viewer.Login,
		"avatar_url":    apiResponseData.Data.Viewer.AvatarURL,
		"name":          apiResponseData.Data.Viewer.Name,
		"bio":           apiResponseData.Data.Viewer.Bio,
		"url":           GistProfileBasePath + apiResponseData.Data.Viewer.Login,
		"gists":         getGistsFromEdges(apiResponseData),
	}

	writeResponseObject(responseWriter, dashboardDataObject)
}

func doHTTPRequest(request *http.Request) *http.Response {
	client := &http.Client{}

	apiResponse, err := client.Do(request)
	if err != nil {
		logError(err, "Cannot Perform Request", request.URL.String())
	}

	return apiResponse
}

func decodeJSON(variable interface{}, reader io.Reader) interface{} {
	decoder := json.NewDecoder(reader)
	err := decoder.Decode(variable)
	if err != nil {
		contents, _ := ioutil.ReadAll(reader)
		logError(err, "Cannot Decode Object", string(contents))
	}

	return variable
}

func sendPusherTrigger(pusherClient pusher.Client, channelName string, eventName string, data interface{}) {
	err := pusherClient.Trigger(channelName, eventName, data)
	if err != nil {
		logError(err, "Cannot send pusher trigger", err.Error())
	}
}

func createPusherClient() pusher.Client {
	return pusher.Client{
		AppID:   os.Getenv("PUSHER_APP_ID"),
		Key:     os.Getenv("PUSHER_APP_KEY"),
		Secret:  os.Getenv("PUSHER_SECRET"),
		Cluster: os.Getenv("PUSHER_CLUSTER"),
		Secure:  true,
	}
}

func getAccessTokenFromCode(accessCode string) string {
	requestParams := map[string]interface{}{
		"client_id":     os.Getenv("GITHUB_CLIENT_ID"),
		"client_secret": os.Getenv("GITHUB_CLIENT_SECRET"),
		"code":          accessCode,
	}

	apiRequest := createPostRequest(os.Getenv("GITHUB_ACCESS_TOKEN_ENDPOINT"), requestParams)
	apiResponse := doHTTPRequest(apiRequest)

	var githubAPIResponse accessTokenResponse
	decodeJSON(&githubAPIResponse, apiResponse.Body)

	return githubAPIResponse.AccessToken
}

func getGistsFromEdges(apiResponseData dashboardData) []hashMap {
	gists := make([]hashMap, 0)
	gistData := apiResponseData.Data.Viewer.Gists.Edges

	for index := range gistData {
		nodeData := gistData[index].Node
		gists = append(gists, map[string]interface{}{
			"id":          nodeData.ID,
			"file_name":   nodeData.Files[0].Name,
			"description": nodeData.Description,
			"timestamp":   strconv.FormatInt(nodeData.UpdatedAt.Unix(), 10),
			"name":        nodeData.Name,
			"url":         nodeData.URL,
			"is_public":   nodeData.IsPublic,
		})
	}

	return gists
}

func createDeleteRequest(url string, token string) *http.Request {
	apiRequest, err := http.NewRequest("DELETE", url, bytes.NewBuffer([]byte{}))
	if err != nil {
		logError(err, "Cannot create request", url)
	}

	apiRequest.Header.Set("Accept", JSONContentType)
	apiRequest.Header.Set("Content-Type", JSONContentType)
	apiRequest.Header.Set("Authorization", "token "+token)

	return apiRequest
}

func createPostRequest(url string, requestParams map[string]interface{}) *http.Request {
	apiRequest, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonEncodeMap(requestParams)))
	if err != nil {
		logError(err, "Cannot create request", url)
	}

	apiRequest.Header.Set("Accept", JSONContentType)
	apiRequest.Header.Set("Content-Type", JSONContentType)

	return apiRequest
}

func createGraphQlRequest(url string, query string, token string) *http.Request {
	apiRequest, err := http.NewRequest("POST", url, bytes.NewBuffer([]byte(query)))
	if err != nil {
		logError(err, "Cannot create request", url)
	}

	apiRequest.Header.Set("Authorization", "bearer "+token)
	apiRequest.Header.Set("Accept", JSONContentType)
	apiRequest.Header.Set("Content-Type", JSONContentType)

	return apiRequest
}

func jsonEncodeMap(mapObject map[string]interface{}) []byte {
	encodedObject, err := json.Marshal(mapObject)
	if err != nil {
		logError(err, "Cannot Encode JSON")
	}

	return encodedObject
}

func writeResponseObject(responseWriter http.ResponseWriter, responseObject map[string]interface{}) {
	responseWriter.Header().Set("Content-Type", JSONContentType)
	responseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	responseWriter.Header().Set("Access-Control-Allow-Methods", "POST, DELETE")
	responseWriter.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	responseWriter.WriteHeader(http.StatusOK)

	responseObjectInBytes, err := json.Marshal(responseObject)
	if err != nil {
		logError(err, "Cannot convert object to string")
	}

	_, err = responseWriter.Write(responseObjectInBytes)
	if err != nil {
		logError(err, "Cannot write response")
	}
}

func logError(err error, parameters ...interface{}) {
	sentry.CaptureException(err)
	sentry.Flush(time.Second * 5)

	log.Println(err.Error(), parameters)
}

func init() {
	err := sentry.Init(sentry.ClientOptions{
		Dsn: os.Getenv("SENTRY_DSN"),
	})

	if err != nil {
		log.Println("Failed to initialize sentry", err.Error())
	}
}

// Handler This is the entry function for all requests. It's responsible for the routing.
func Handler(responseWriter http.ResponseWriter, request *http.Request) {
	if request.URL.Path == PathDashboard && request.Method == http.MethodPost {
		handleDashboard(responseWriter, request)
	} else if request.URL.Path == PathDelete && request.Method == http.MethodDelete {
		handleDelete(responseWriter, request)
	} else {
		handleCatchAll(responseWriter, request)
	}
}
