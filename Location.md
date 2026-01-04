Location dropdowns for states, areas, etc




Location API Documentation
Overview
The Location API provides endpoints for retrieving state information and branches filtered by state. These endpoints are useful for populating dropdown lists and filtering branch information based on user location or selected state.

Base URL
/api/location/
Authentication
All endpoints require authentication using JWT Bearer token. Include the token in the Authorization header:

Authorization: Bearer <your_access_token>
Endpoints
1. Get User State and Branches
Retrieves the current authenticated user's state and all branches filtered by state. If a state parameter is provided in the query string, branches are filtered by that state. Otherwise, branches are filtered by the user's state.

Endpoint: GET /api/location/user-state-branches

Authentication: Required (IsAuthenticated)

Query Parameters:

Parameter	Type	Required	Description
state	string/int	No	State ID or state name to filter branches. If not provided, uses the authenticated user's state.
Query Parameter Examples:

?state=1 - Filter by state ID
?state=Rajasthan - Filter by state name
No parameter - Uses user's state from their employee record
Success Response (200):

{
  "user_state": {
    "id": 1,
    "name": "Rajasthan",
    "code": "RJ"
  },
  "branches": [
    {
      "id": 1,
      "name": "Jaipur Main Branch",
      "address": "123 Main Street, Jaipur",
      "latitude": 26.9124,
      "longitude": 75.7873,
      "pin_code": "302001",
      "city": "Jaipur",
      "state": "Rajasthan"
    },
    {
      "id": 2,
      "name": "Udaipur Branch",
      "address": "456 Lake Road, Udaipur",
      "latitude": 24.5854,
      "longitude": 73.7125,
      "pin_code": "313001",
      "city": "Udaipur",
      "state": "Rajasthan"
    }
  ]
}
Response Fields:

user_state (object, nullable): The authenticated user's state from their employee record
id (integer): State ID
name (string): State name
code (string): State code (2-letter code)
branches (array): List of branches filtered by the state
id (integer): Branch ID
name (string): Branch name
address (string, nullable): Branch address
latitude (float, nullable): Branch latitude coordinate
longitude (float, nullable): Branch longitude coordinate
pin_code (string, nullable): Branch pin code
city (string): City name
state (string): State name
Error Response (404):

If the state parameter is provided but the state is not found:

{
  "error": "State not found"
}
Error Response (401):

If authentication is missing or invalid:

{
  "detail": "Authentication credentials were not provided."
}
Example Requests:

# Get branches for user's state
curl -X GET "http://localhost:8000/api/location/user-state-branches" \
  -H "Authorization: Bearer <your_access_token>"

# Get branches for a specific state by ID
curl -X GET "http://localhost:8000/api/location/user-state-branches?state=1" \
  -H "Authorization: Bearer <your_access_token>"

# Get branches for a specific state by name
curl -X GET "http://localhost:8000/api/location/user-state-branches?state=Rajasthan" \
  -H "Authorization: Bearer <your_access_token>"
Status Codes:

200 OK: Request successful
401 Unauthorized: Authentication required or invalid
404 Not Found: State not found (when state parameter is provided)
Notes:

If the user doesn't have an employee record or the employee doesn't have a state assigned, user_state will be null
If no state parameter is provided and the user has no state, branches will be an empty array
The state parameter can be either a numeric ID or a state name string
Branch names, cities, and states are returned as strings for easy display
2. Get All States
Retrieves a list of all states ordered by name. Useful for populating dropdown lists in the frontend.

Endpoint: GET /api/location/states

Authentication: Required (IsAuthenticated)

Query Parameters: None

Success Response (200):

[
  {
    "id": 1,
    "name": "Andhra Pradesh",
    "code": "AP"
  },
  {
    "id": 2,
    "name": "Karnataka",
    "code": "KA"
  },
  {
    "id": 3,
    "name": "Rajasthan",
    "code": "RJ"
  },
  {
    "id": 4,
    "name": "Tamil Nadu",
    "code": "TN"
  },
  {
    "id": 5,
    "name": "Telangana",
    "code": "TS"
  },
  {
    "id": 6,
    "name": "Uttar Pradesh",
    "code": "UP"
  }
]
Response Fields:

Each state object contains:

id (integer): State ID
name (string): State name (ordered alphabetically)
code (string): State code (2-letter code, may be null)
Error Response (401):

If authentication is missing or invalid:

{
  "detail": "Authentication credentials were not provided."
}
Example Request:

curl -X GET "http://localhost:8000/api/location/states" \
  -H "Authorization: Bearer <your_access_token>"
Status Codes:

200 OK: Request successful
401 Unauthorized: Authentication required or invalid
Notes:

States are returned in alphabetical order by name
The code field may be null for some states
This endpoint is ideal for populating state dropdowns in forms
Use Cases
Populating State Dropdown
Call GET /api/location/states to get all available states
Display states in a dropdown component
When user selects a state, use the state ID or name to filter branches
Filtering Branches by State
Optionally get user's state from GET /api/location/user-state-branches (without state parameter)
Allow user to select a different state from dropdown
Call GET /api/location/user-state-branches?state=<state_id_or_name> to get filtered branches
Display branches in a list or map view
Getting User's Default Branches
Call GET /api/location/user-state-branches without any parameters
The API automatically filters branches based on the authenticated user's state
Display the user's state and associated branches
200 OK: Successful request
401 Unauthorized: Missing or invalid authentication token
404 Not Found: Requested resource not found (e.g., state ID/name doesn't exist)
500 Internal Server Error: Server error
Always check the response status code and handle errors appropriately in your client application.