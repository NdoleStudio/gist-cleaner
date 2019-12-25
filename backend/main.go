package main

import (
	"bytes"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

const API_VERSION = "v1"
const JSON_CONTENT_TYPE = "application/json"
const DASHBOARD_DATA_QUERY = "{\"query\": \"query {viewer{login bio avatarUrl url name gists(first:50,orderBy:{field:CREATED_AT,direction:DESC}){edges{node{id files{name} description url updatedAt name}}}}}\"}"

type accessTokenResponse struct {
	AccessToken string `json:"access_token"`
	ErrorDescription string `json:"error_description"`
	Error string `json:"error"`
}

type DashboardRequest struct {
	Code string `json:"code"`
}

type DashboardData struct {
	Data struct {
		Viewer struct {
			Login     string `json:"login"`
			Bio       string `json:"bio"`
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
					} `json:"node"`
				} `json:"edges"`
			} `json:"gists"`
		} `json:"viewer"`
	} `json:"data"`
}

type hashMap map[string]string


func handleRoot(responseWriter http.ResponseWriter, request *http.Request) {
	responseObject := map[string]interface{}{
		"apiVersion": API_VERSION,
	}

	writeResponseObject(responseWriter, responseObject)
}

//func notFound(responseWriter http.ResponseWriter, r *http.Request) {
//	writeResponseObject(responseWriter, map[string]interface{}{"how": "fine"})
//}

func handleDashboard(responseWriter http.ResponseWriter, request *http.Request) {
	decoder := json.NewDecoder(request.Body)
	var dashboardRequest DashboardRequest
	err := decoder.Decode(&dashboardRequest)
	if err != nil {
		panic(err)
	}

	requestParams := map[string]interface{} {
		"client_id" : os.Getenv("GITHUB_CLIENT_ID"),
		"client_secret" : os.Getenv("GITHUB_CLIENT_SECRET"),
		"code": dashboardRequest.Code,
	}

	log.Println("Code =" + dashboardRequest.Code)

	apiRequest := createPostRequest(os.Getenv("GITHUB_ACCESS_TOKEN_ENDPOINT"), requestParams)

	client := &http.Client{}
	apiResponse, _ := client.Do(apiRequest)

	decoder = json.NewDecoder(apiResponse.Body)
	var githubApiResponse accessTokenResponse
	err = decoder.Decode(&githubApiResponse)
	if err != nil {
		panic(err)
	}

	log.Println("Access Token =" + githubApiResponse.AccessToken)

	apiRequest = createGraphQlRequest(os.Getenv("GITHUB_GRAPHQL_API"), DASHBOARD_DATA_QUERY, githubApiResponse.AccessToken)
	apiResponse, _ = client.Do(apiRequest)

	decoder = json.NewDecoder(apiResponse.Body)
	var apiResponseData DashboardData
	err = decoder.Decode(&apiResponseData)
	if err != nil {
		panic(err)
	}

	dashboardDataObject := map[string]interface{}{
		"access_token": githubApiResponse.AccessToken,
		"error": false,
		"is_successful": true,
		"username": apiResponseData.Data.Viewer.Login,
		"avatar_url": apiResponseData.Data.Viewer.AvatarURL,
		"name": apiResponseData.Data.Viewer.Name,
		"bio" : apiResponseData.Data.Viewer.Bio,
		"url" : apiResponseData.Data.Viewer.URL,
		"gists": getGistsFromEdges(apiResponseData),
	}

	writeResponseObject(responseWriter, dashboardDataObject)
}

func getGistsFromEdges(apiResponseData DashboardData) []hashMap {
	gists := make([]hashMap, 0)
	gistData :=apiResponseData.Data.Viewer.Gists.Edges

	for k := range gistData {
		nodeData := gistData[k].Node;
		gists = append(gists, map[string]string {
			"id": nodeData.ID,
			"file_name": nodeData.Files[0].Name,
			"description": nodeData.Description,
			"timestamp": strconv.FormatInt(nodeData.UpdatedAt.Unix(), 10),
			"name": nodeData.Name,
			"url": nodeData.URL,
		})
	}

	return gists
}

func createPostRequest(url string, requestParams map[string]interface{}) *http.Request {
	apiRequest, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonEncodeMap(requestParams)))
	if err != nil {
		log.Println("Cannot create request")
	}
	apiRequest.Header.Set("Accept", JSON_CONTENT_TYPE)
	apiRequest.Header.Set("Content-Type", JSON_CONTENT_TYPE)

	return apiRequest
}

func createGraphQlRequest(url string, query string, token string) *http.Request {
	apiRequest, err := http.NewRequest("POST", url, bytes.NewBuffer([]byte(query)))
	if err != nil {
		log.Println("Cannot create request")
	}

	apiRequest.Header.Set("Authorization", "bearer " + token)
	apiRequest.Header.Set("Accept", JSON_CONTENT_TYPE)
	apiRequest.Header.Set("Content-Type", JSON_CONTENT_TYPE)

	return apiRequest
}

func jsonEncodeMap(mapObject map[string]interface{}) []byte {
	encodedObject, _ := json.Marshal(mapObject)
	return encodedObject
}

func writeResponseObject(responseWriter http.ResponseWriter, responseObject map[string] interface{}) {
	responseWriter.Header().Set("Content-Type", JSON_CONTENT_TYPE)
	responseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	responseWriter.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	responseWriter.WriteHeader(http.StatusOK)

	responseObjectInBytes, err := json.Marshal(responseObject)
	if err != nil {
		log.Fatalln("Cannot convert object to string")
	}

	_, err = responseWriter.Write(responseObjectInBytes)
	if err != nil {
		log.Fatalln("Cannot write response")
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	r := mux.NewRouter()
	r.HandleFunc("/", handleRoot)

	api := r.PathPrefix("/" + API_VERSION).Subrouter()
	api.HandleFunc("/", handleRoot)
	api.HandleFunc("/dashboard", handleDashboard).Methods(http.MethodPost)
	api.HandleFunc("/dashboard", handleRoot).Methods(http.MethodOptions)

	log.Println("Server started")
	log.Fatalln(http.ListenAndServe(":8080", r))
}
