# Gist Cleaner

This is a web app to help you delete multiple gists on github at once. **Why?** Currently github doesn't provide this functionality for you to delete multiple gists at once.

if you have any suggestions/questions, open a PR or issue on github. If you're not inclined to make PRs you can tweet me at [@acho_arnold](https://twitter.com/acho_arnold)!

## Directory Structure

This web app follows the subscribe to the [monolithic repo philosophy](https://danluu.com/monorepo/). So there’s one and only one repo, containing deploy scripts, frontend & backend code. The frontend code is inside the [./frontend](./frontend) directory and the backend code is inside the [./backend](./backend) directory. There's some github-actions configuration to easily deploy to firebase when a push is one to the master branch. The code for this is found inside the [./.github/workflows](./.github/workflows) directory

## Architecture

### Frontend

#### Dependencies

- React
- PusherJs
- React Router
- React-Toastify
- Moment JS
- React Router
- TailwindCss

#### Philosophy

This app was created using the [create react app](https://github.com/facebook/create-react-app) tool since it's written in react.js that's a really handy tool to quickly build a react app with little or no configuration. I ❤️ it.

The React Router package is used to handle the routing in the frontend. There are currently just 3 routes

- `/` - This route is responsible for rendering the landing page. The code for this page is found inside the [./frontend/src/pages/LandingPage](./frontend/src/pages/LandingPage) directory 
- `/dasbhoard` - This route is responsible for rendering the dashboard page where a user can see all their gists and they can select multiple gists to delete. The code for this page is found inside the [./frontend/src/pages/Dashboard](./frontend/src/pages/Dashboard) directory.
- `*` - This serves as a catch all route which renderers a 404 page if a user tries to visit an invalid route. The code for this page is found inside the [./frontend/src/pages/404](./frontend/src/pages/404) directory.


[TailwindCss](https://tailwindcss.com/) is used to build the frontend as far as styling is concerned. There are a few `style.css` files which contains styles which are specific to a particular page. 

[React-Toastify](https://github.com/fkhadra/react-toastify) is to easily notify users when they perform a gist delete action on the app and when there's an error when doing an API request.


[Pusher-Js](https://github.com/pusher/pusher-js) is used to send real time socket notifications from the backend to the frontend app. When a user deletes gists, was soon as each gist is deleted by the backend, it sends a notification to the user informing them of the gist begin deleted. The free pusher-js plan is used so there's a limit to `100` simultaneous connections. To make the app resource efficient, a connection to pusher is created only when the user deletes gists and as soon as all the gists are deleted, the connection is killed.

[postcss-purgecss](https://github.com/FullHuman/purgecss) is used to delete unnecessary tailwind css classes which are not being used anywhere. The original size of tailwindcss is `783.5kb` but chances are that only a few classes are actually used throughout the project so `purgecss` is a really handy tool in deleted unused css files

#### Hosting

This app is hosted for free on [firebase](https://firebase.google.com/) which provides SSD storage and a super fast global CDN (content delivery network). There's a github action configuration to deploy to firebase when a push is done on the `master` branch. The code for this is found in [./.github/workflows/firebase.yml](./.github/workflows/firebase.yml).

#### Testing 

To run tests, do the command `yarn test` currently there are just tests to ensure that the various components can be rendered without any errors. More tests are appreciated!

### Backend

#### Dependencies

- Sentry
- Pusher

#### Philosophy

The backend is written completely in `Go` using [serverless functions](https://zeit.co/docs/v2/serverless-functions/introduction/). It's hosted on [Ziet](https://zeit.co) and the serverless functions are written with this platform in mind.

Routing is done by the `Handler` method in the `main.go` file. There's a rule in the `now.json` configuration which routes all requests to this handler and this handler is responsible for calling other functions to handle the request. There are currently 3 routes

- `POST` `/dashboard` - This route is responsible for providing the data which is required by the `dashboard` view in the frontend. This route is handled by the `handleDashbord` method. Here, a graphql query is run against the github api to provide all the data in 1 request. This API endpoint requires either a github `auth code` or an  `access_token`. The request body **MUST** be in a JSON format according to the structure defined in `type DashboardRequest struct`
- `DELETE` `/delete` - This route is responsible for deleting an array of gists. The route is handled by the `handleDelete` method. And it deletes multiple gists concurrently. It's also responsible for sending a message back to the frontend when each gist is deleted and when all the gists have been deleted using `pusher`. The endpoint requires the github `access_token` and an array of gists to be deleted. The request body **MUST** be in a JSON format according to the format defined in `type DeleteRequest struct`.
- `*` - This is catch-all route for all other requests which are not either of the 2 defined above. It just returns the API version and the URL requested.

[Sentry](https://sentry.io) is used for application monitoring, with a focus on error reporting. It makes it really easy to see the errors that occur when running the serverless functions.


#### Hosting

The backend is hosted for free on [Ziet (now.sh)](https://zeit.co) and it's handled completely using serverless functions. The [./.backend/now.json](./.backend/now.json) file provides the configuration needed for building and deploying the functions. A new deploy is made to production each time there's a push on the master branch.

A point to note here is this line `{ "source": "(.*)", "destination": "backend/main.go" }` which enforces that all requests which are made to the app are sent to the `Handler` function in the `main.go` file. So this handler function acts as a router for performing the requests.

#### Testing 

There are no automated tests at the moment. More help will this will be appreciated! 

## License

MIT licensed. See the [LICENSE](./LICENSE) file for details.