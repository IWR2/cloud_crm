# Cloud Service CRM API

App URL: <https://cloud-crm-351300.wl.r.appspot.com>

This is a REST API using Google Datastore that allows users to create clients and assign them cloud services.

# Change Log

| **Version** | **Change**       | **Date**     |
|-------------|------------------|--------------|
| 1.0         | Initial version. | May 16, 2022 |
| 1.1         | Current Version. | June 1, 2022 |

# Data Model

The app stores four kinds of entities in Datastore: Users, Subscribers, and Cloud Services.

## User

| **Property**       | **Data Type** | **Notes**                                                  |
|--------------------|---------------|------------------------------------------------------------|
| “id” : “123”       | integer       | The id of the user. Datastore automatically generates it.  |
| “subject” : ”EPIC” | string        | The user’s sub property taken from their JWT.              |

### Relationships

1:M relationship between Clients. A User can be associated with 0 or multiple Clients. A Client must have one User.

### Datastore

Google Datastore will store the ID and subject value of each User.

## Clients

| **Property**                          | **Data Type**            | **Notes**                                                                                                           |
|---------------------------------------|--------------------------|---------------------------------------------------------------------------------------------------------------------|
| “id” : “456”                          | integer                  | The id of the client. Datastore automatically generates it.                                                         |
| “name” : “Real Engine”                | string                   | The client’s name.                                                                                                  |
| “contact_manager”: “Sim Tweeny”       | string                   | The client’s contact manager.                                                                                       |
| “email” : “sim_tweeny@realengine.com” | string                   | The client’s email.                                                                                                 |
| “services” : [ ]                      | array of service objects | If a client has any services, then it is the array of service objects containing its ID. Otherwise, an empty array. |
| “owner” : “EPIC”                      | string                   | If the client has an assigned owner, then it is the sub value of its assigned owner.                                |
| self                                  | string                   | The self link of the client.                                                                                        |

### Relationships

M:1 relationship between Users. A Client must have one User. A User can be associated with 0 or multiple Clients.

1:M relationship between Services. Services can be associated with 0 or 1 Client. Clients can have 0 or multiple Services.

### Datastore

Google Datastore will store the ID, name, contact_manager, email, and owner of each Client. For each Service in Services, Datastore will store an object containing the Service’s ID, name, type, and price.

## Services

| **Property**                 | **Data Type** | **Notes**                                                                       |
|------------------------------|---------------|---------------------------------------------------------------------------------|
| “id” : “100”                 | integer       | The id of the service. Datastore automatically generates it.                    |
| “name” : “MVIDIA Mesla A100” | string        | The name of the service.                                                        |
| “type” : “IaaS”              | string        | The type of the service.                                                        |
| “price” : 30500.00           | float         | The monthly cost in USD of a service. This value must be a non-negative number. |
| “client” : “456”             | integer       | If the service has a client, then it is the ID of the client. Otherwise, null.  |
| self                         | string        | The self link of the service.                                                   |

### Relationships

M:1 relationship between Clients. Clients can have 0 or multiple Services. Services can be can only have single Clients.

### Datastore

Google Datastore will store the ID, name, type, price, and client of each Service.

# Endpoints

| **Endpoint**                            | **Methods\***           |
|-----------------------------------------|-------------------------|
| /services                               | POST, GET               |
| /services/:service_id                   | GET, PUT, PATCH, DELETE |
| /clients                                | POST, GET               |
| /clients:client_id                      | GET, PUT, PATCH, DELETE |
| /clients: client \_id/services          | GET                     |
| /clients:client_id/services/:service_id | PUT, DELETE             |
| /users                                  | GET                     |

**\* Unsupported methods will return a 405 Method Not Allowed error.**

#### Status: 405 Method Not Allowed

| {  "Error": "Method not allowed" } |
|------------------------------------|

# Get all Users

Gets all users for this application.

| GET /users |
|------------|

## Request

### Path Parameters

None

### Request Body

Required

### Request Header

| **Field** | **Description**                                                         | **Required?** |
|-----------|-------------------------------------------------------------------------|---------------|
| Accept    | The format of the content to be returned. Must be **application/json**. | Yes           |

### Request Body

None

## Response

### Response Body Format

JSON

### Response Statuses

| **Outcome** | **Status Code**    | **Notes**                                            |
|-------------|--------------------|------------------------------------------------------|
| Success     | 200 OK             |                                                      |
| Failure     | 406 Not Acceptable | Request content-type is not supported or is missing. |

### Response Examples

#### Status: 200 OK

| {  "results": [  {  "id": "4763052276711424",  "subject": "110853085749362908724"  },  {  "id": "6366479599534080",  "subject": "108860368623644752447"  }  ] } |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|

#### 

#### Status: 406 Not Acceptable

| {  "Error": "Client must accept application/json" } |
|-----------------------------------------------------|

# Create a Service

Creates a new service.

| POST /services |
|----------------|

## Request

### Path Parameters

None

### Request Header

| **Field** | **Description**                                                         | **Required?** |
|-----------|-------------------------------------------------------------------------|---------------|
| Accept    | The format of the content to be returned. Must be **application/json**. | Yes           |

### Request Body

Required

### Request Body Format

JSON

### Request JSON Attributes

| **Name** | **Type** | **Description**                       | **Required?** |
|----------|----------|---------------------------------------|---------------|
| name     | string   | The name of the service.              | Yes           |
| type     | string   | The name of the service type          | Yes           |
| price    | float    | The monthly cost in USD of a service. | Yes           |

### Request Body Example

| {  "name": "MVIDIA Mesla A100",  "type": "IaaS",  "price": 30500.00 } |
|-----------------------------------------------------------------------|

## Response

### Response Body Format

JSON

### Response Statuses

| **Outcome** | **Status Code**            | **Notes**                                                                                                    |
|-------------|----------------------------|--------------------------------------------------------------------------------------------------------------|
| Success     | 201 Created                | Returns response body.                                                                                       |
| Failure     | 400 Bad Request            | Request is missing required parameters, using an unsupported attribute, or using a negative value for price. |
| Failure     | 406 Not Acceptable         | Request Accept header is not supported or is missing.                                                        |
| Failure     | 415 Unsupported Media Type | Request Content-Type header is not supported or is missing.                                                  |

### Response Examples

#### Status: 201 Created

| {  "id": "100",  "name": "MVIDIA Mesla A100",  "type": "IaaS",  "price": 30500,  "client": null,  "self": "http://\<your-app\>/services/100" } |
|------------------------------------------------------------------------------------------------------------------------------------------------|

#### 

#### Status: 400 Bad Request

| {  "Error": "The request object is missing at least one of the required attributes" } |
|---------------------------------------------------------------------------------------|

#### 

| {  "Error": "The request object includes at least one not supported attribute" } |
|----------------------------------------------------------------------------------|

#### 

| {  "Error": "The price attribute must be a non-negative number" } |
|-------------------------------------------------------------------|

#### Status: 406 Not Acceptable

| {  "Error": "Client must accept application/json" } |
|-----------------------------------------------------|

#### Status: 415 Unsupported Media Type

| {  "Error": "Server only accepts application/json data" } |
|-----------------------------------------------------------|

# Get a Service

Gets an existing service.

| GET /service/:service_id |
|--------------------------|

## Request

### Path Parameters

| **Name**   | **Type** | **Description**        | **Required?** |
|------------|----------|------------------------|---------------|
| service_id | string   | The id of the service. | Yes           |

### Request Header

| **Field** | **Description**                                                         | **Required?** |
|-----------|-------------------------------------------------------------------------|---------------|
| Accept    | The format of the content to be returned. Must be **application/json**. | Yes           |

### Request Body

None

## Response

### Response Body Format

JSON

### Response Statuses

| **Outcome** | **Status Code**    | **Notes**                                            |
|-------------|--------------------|------------------------------------------------------|
| Success     | 200 OK             |                                                      |
| Failure     | 404 Not Found      | No service with the given service_id exists.         |
| Failure     | 406 Not Acceptable | Request content-type is not supported or is missing. |

### Response Examples

#### Status: 200 OK

| {  "id": "100",  "name": "MVIDIA Mesla A100",  "type": "IaaS",  "price": 30500,  "client": null,  "self": "http://\<your-app\>/services/100" } |
|------------------------------------------------------------------------------------------------------------------------------------------------|

#### 

#### Status: 404 Not Found

| {  "Error": "No service with this service_id exists" } |
|--------------------------------------------------------|

#### Status: 406 Not Acceptable

| {  "Error": "Client must accept application/json" } |
|-----------------------------------------------------|

# Get all Services

Lists all the services. This implements pagination. It returns 5 services per page.

| GET /services?cursor=cursor_id |
|--------------------------------|

## Request

### Path Parameters

| **Name**  | **Type** | **Description**                                               | **Required?** |
|-----------|----------|---------------------------------------------------------------|---------------|
| cursor_id | string   | The request query cursor that marks the last result received. | No            |

### Request Header

| **Field** | **Description**                                                         | **Required?** |
|-----------|-------------------------------------------------------------------------|---------------|
| Accept    | The format of the content to be returned. Must be **application/json**. | Yes           |

### Request Body

None

## Response

### Response Body Format

JSON

### Response Statuses

| **Outcome** | **Status Code**    | **Notes**                                            |
|-------------|--------------------|------------------------------------------------------|
| Success     | 200 OK             |                                                      |
| Failure     | 406 Not Acceptable | Request content-type is not supported or is missing. |

### Response Examples

#### Status: 200 OK

| {  "services": [  {  "id": "100",  "name": "Mintel Ice Lake CPU",  "type": "IaaS",  "price": 1950.55,  "client": null,  "self": "https://\<your-app\>/services/100"  },  {  "id": "2",  "name": "MVIDIA Mesla A100",  "type": "IaaS",  "price": 30500,  "client": null,  "self": "https://\<your-app\>/services/2"  },  {  "id": "456",  "name": "Moogle Cloud",  "type": "SaaS",  "price": 1000,  "client": null,  "self": "https://\<your-app\>/services/456"  },  {  "id": "3",  "name": "NMD EPYC Milan CPU Platform",  "type": "IaaS",  "price": 1900.55,  "client": null,  "self": "https://\<your-app\>/services/3"  },  {  "id": "5",  "name": "Mintel Cascade Lake CPU",  "type": "IaaS",  "price": 55800,  "client": null,  "self": "https://\<your-app\>/services/5"  }  ],  "next": "http://\<your-app\>/services?cursor=...",  "items": 6 } |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

#### Status: 406 Not Acceptable

| {  "Error": "Client must accept application/json" } |
|-----------------------------------------------------|

# Replace a Service

Replaces an existing service with all new attribute values.

| PUT /service/:service_id |
|--------------------------|

## Request

### Path Parameters

| **Name**   | **Type** | **Description**        | **Required?** |
|------------|----------|------------------------|---------------|
| service_id | string   | The id of the service. | Yes           |

### Request Header

| **Field** | **Description**                                                         | **Required?** |
|-----------|-------------------------------------------------------------------------|---------------|
| Accept    | The format of the content to be returned. Must be **application/json**. | Yes           |

### Request Body

Required

### Request Body Format

JSON

### Request JSON Attributes

| **Name** | **Type** | **Description**                       | **Required?** |
|----------|----------|---------------------------------------|---------------|
| name     | string   | The name of the service.              | Yes           |
| type     | string   | The name of the service type          | Yes           |
| price    | float    | The monthly cost in USD of a service. | Yes           |

### Request Body Example

| {  "name": "MVIDIA Mesla T4",  "type": "Trial IaaS",  "price": 1500.00, } |
|---------------------------------------------------------------------------|

## Response

### Response Body Format

JSON

### Response Statuses

| **Outcome** | **Status Code**            | **Notes**                                                                                                                           |
|-------------|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| Success     | 201 Created                | Response body returns updated service. The Location header is set as the link to the updated service.                               |
| Failure     | 400 Bad Request            | Request is missing required attributes, using an unsupported attribute, price is not a number, or using a negative value for price. |
| Failure     | 403 Forbidden              | Client attempts to modify service_id or client.                                                                                     |
| Failure     | 404 Not Found              | No service with this service_id exists.                                                                                             |
| Failure     | 406 Not Acceptable         | Request content-type is not supported or is missing.                                                                                |
| Failure     | 415 Unsupported Media Type | Request Content-Type header is not supported or is missing.                                                                         |

### Response Examples

#### Status: 201 Created

| {  "id": "100",  "name": "MVIDIA Mesla T4",  "type": "IaaS",  "price": 30500,  "client": null,  "self": "http://\<your-app\>/services/100" } |
|----------------------------------------------------------------------------------------------------------------------------------------------|

#### Status: 400 Bad Request

| {  "Error": "The request object is missing at least one of the required attributes" } |
|---------------------------------------------------------------------------------------|

#### 

| {  "Error": "The request object includes at least one unsupported attribute" } |
|--------------------------------------------------------------------------------|

#### 

| {  "Error": "The price attribute must be a non-negative number" } |
|-------------------------------------------------------------------|

#### Status: 403 Forbidden

| {  "Error": "service_id cannot be modified" } |
|-----------------------------------------------|

| {  "Error": "client cannot be modified" } |
|-------------------------------------------|

#### Status: 404 Not Found

| {  "Error": "No service with this service_id exists" } |
|--------------------------------------------------------|

#### Status: 406 Not Acceptable

| {  "Error": "Client must accept application/json" } |
|-----------------------------------------------------|

#### Status: 415 Unsupported Media Type

| {  "Error": "Server only accepts application/json data" } |
|-----------------------------------------------------------|

# Update a Service

Updates one or more attributes of an existing service.

| PATCH /service/:service_id |
|----------------------------|

## Request

### Path Parameters

| **Name**   | **Type** | **Description**        | **Required?** |
|------------|----------|------------------------|---------------|
| service_id | string   | The id of the service. | Yes           |

### Request Header

| **Field** | **Description**                                                         | **Required?** |
|-----------|-------------------------------------------------------------------------|---------------|
| Accept    | The format of the content to be returned. Must be **application/json**. | Yes           |

### Request Body

Required

### Request Body Format

JSON

### Request JSON Attributes

| **Name** | **Type** | **Description**                       | **Required?** |
|----------|----------|---------------------------------------|---------------|
| name     | string   | The name of the service.              | No            |
| type     | string   | The name of the service type          | No            |
| price    | float    | The monthly cost in USD of a service. | No            |

### Request Body Example

| {  "price": 2100.00 } |
|-----------------------|

## Response

### Response Body Format

JSON

### Response Statuses

| **Outcome** | **Status Code**            | **Notes**                                                                                                                                           |
|-------------|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Success     | 200 OK                     | Response body returns updated service. The Location header is set as the link to the updated service.                                               |
| Failure     | 400 Bad Request            | Request is missing all attributes, using an unsupported attribute, too many attributes, price is not a number, or using a negative value for price. |
| Failure     | 403 Forbidden              | Client attempts to modify service_id or client.                                                                                                     |
| Failure     | 404 Not Found              | No service with this service_id exists.                                                                                                             |
| Failure     | 406 Not Acceptable         | Request content-type is not supported or is missing.                                                                                                |
| Failure     | 415 Unsupported Media Type | Request Content-Type header is not supported or is missing.                                                                                         |

### Response Examples

#### Status: 200 OK

| {  "id": "100",  "name": "MVIDIA Mesla T4",  "type": "IaaS",  "price": 2100,  "client": null,  "self": "http://\<your-app\>/services/100" } |
|---------------------------------------------------------------------------------------------------------------------------------------------|

#### 

#### Status: 400 Bad Request

| {  "Error": "The request object must include at least one supported attribute" } |
|----------------------------------------------------------------------------------|

#### 

| {  "Error": "The request object includes at least one unsupported attribute" } |
|--------------------------------------------------------------------------------|

#### 

| {  "Error": "The price attribute must be a non-negative number" } |
|-------------------------------------------------------------------|

#### Status: 403 Forbidden

| {  "Error": "service_id cannot be modified" } |
|-----------------------------------------------|

#### 

| {  "Error": "client cannot be modified" } |
|-------------------------------------------|

#### Status: 404 Not Found

| {  "Error": "No service with this service_id exists" } |
|--------------------------------------------------------|

#### Status: 406 Not Acceptable

| {  "Error": "Client must accept application/json" } |
|-----------------------------------------------------|

#### Status: 415 Unsupported Media Type

| {  "Error": "Server only accepts application/json data" } |
|-----------------------------------------------------------|

# Delete a Service

Deletes a service. Note that if the service has any client, deleting the service will disassociate any client using this service.

| DELETE /services/:service_id |
|------------------------------|

## Request

### Path Parameters

| **Name**   | **Type** | **Description**        | **Required?** |
|------------|----------|------------------------|---------------|
| service_id | string   | The id of the service. | Yes           |

### Request Header

| **Field** | **Description**                                                         | **Required?** |
|-----------|-------------------------------------------------------------------------|---------------|
| Accept    | The format of the content to be returned. Must be **application/json**. | Yes           |

### Request Body

None

## Response

No body

### Response Body Format

Success: No body

Failure: JSON

### Response Statuses

| **Outcome** | **Status Code** | **Notes**                        |
|-------------|-----------------|----------------------------------|
| Success     | 204 No Content  |                                  |
| Failure     | 404 Not Found   | No boat with this boat_id exists |

### Response Examples

#### Status: 204 No Content

|   |
|---|

#### 

#### Status: 404 Not Found

| {  "Error": "No service with this service_id exists" } |
|--------------------------------------------------------|

# Create a Client

Creates a new client.

| POST /clients |
|---------------|

## Request

### Path Parameters

None

### Request Body

Required

### Request Header

| **Field**     | **Description**                                                         | **Required?** |
|---------------|-------------------------------------------------------------------------|---------------|
| Accept        | The format of the content to be returned. Must be **application/json**. | Yes           |
| Authorization | A JSON Web token identifying the user.                                  | Yes           |

### Request Body Format

JSON

### Request JSON Attributes

| **Name**        | **Type** | **Description**               | **Required?** |
|-----------------|----------|-------------------------------|---------------|
| name            | string   | The client's name.            | Yes           |
| contact_manager | string   | The client's contact manager. | Yes           |
| email           | float    | The client's email.           | Yes           |

### Request Body Example

| {  "name": "Real Engine",  "contact_manager": "Sim Tweeny",  "email": "sim_tweeny@realengine.com", } |
|------------------------------------------------------------------------------------------------------|

## Response

### Response Body Format

JSON

### Response Statuses

| **Outcome** | **Status Code**            | **Notes**                                                                 |
|-------------|----------------------------|---------------------------------------------------------------------------|
| Success     | 201 Created                | Returns response body.                                                    |
| Failure     | 400 Bad Request            | Request is missing required parameters or using an unsupported attribute. |
| Failure     | 401 Unauthorized           | Request is missing credentials or credentials were invalid.               |
| Failure     | 406 Not Acceptable         | Request Accept header is not supported or is missing.                     |
| Failure     | 415 Unsupported Media Type | Request Content-Type header is not supported or is missing.               |

### Response Examples

#### Status: 201 Created

| {  "id": "456",  "name": "Real Engine",  "contact_manager": "Sim Tweeny",  "email": "sim_tweeny@realengine.com",  "email": "EPIC",  "self": "http://\<your-app\>/clients/456" } |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

#### 

#### Status: 400 Bad Request

| {  "Error": "The request object is missing at least one of the required attributes" } |
|---------------------------------------------------------------------------------------|

#### 

| {  "Error": "The request object includes at least one unsupported attribute" } |
|--------------------------------------------------------------------------------|

#### Status: 401 Unauthorized

| {  "Error": "The request object is missing credentials or credentials are invalid" } |
|--------------------------------------------------------------------------------------|

#### Status: 406 Not Acceptable

| {  "Error": "Client must accept application/json" } |
|-----------------------------------------------------|

#### Status: 415 Unsupported Media Type

| {  "Error": "Server only accepts application/json data" } |
|-----------------------------------------------------------|

# Get a Client for a User

Gets an existing client for a user.

| GET /clients/:client_id |
|-------------------------|

## Request

### Path Parameters

| **Name**  | **Type** | **Description**       | **Required?** |
|-----------|----------|-----------------------|---------------|
| client_id | string   | The id of the client. | Yes           |

### Request Header

| **Field**     | **Description**                                                         | **Required?** |
|---------------|-------------------------------------------------------------------------|---------------|
| Accept        | The format of the content to be returned. Must be **application/json**. | Yes           |
| Authorization | A JSON Web token identifying the user.                                  | Yes           |

### Request Body

None

## Response

### Response Body Format

JSON

### Response Statuses

| **Outcome** | **Status Code**    | **Notes**                                                                                    |
|-------------|--------------------|----------------------------------------------------------------------------------------------|
| Success     | 200 OK             |                                                                                              |
| Failure     | 401 Unauthorized   | Request is missing credentials or credentials were invalid.                                  |
| Failure     | 403 Forbidden      | Request contains credentials for a user that does not have access privileges to this client. |
| Failure     | 404 Not Found      | No service with the given client_id exists.                                                  |
| Failure     | 406 Not Acceptable | Request content-type is not supported or is missing.                                         |

### Response Examples

#### Status: 200 OK

| {  "id": "456",  "name": "Real Engine",  "contact_manager": "Sim Tweeny",  "email": "sim_tweeny@realengine.com",  "services": [],  "owner": "EPIC",  "self": "http://\<your-app\>/clients/456" } |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

#### 

#### Status: 401 Unauthorized

| {  "Error": "The request object is missing credentials or credentials are invalid" } |
|--------------------------------------------------------------------------------------|

#### 

#### Status: 403 Forbidden

| {  "Error": "The user does not have access privileges to this client" } |
|-------------------------------------------------------------------------|

#### Status: 404 Not Found

| {  "Error": "No client with this client_id exists" } |
|------------------------------------------------------|

#### Status: 406 Not Acceptable

| {  "Error": "Client must accept application/json" } |
|-----------------------------------------------------|

# Get all Clients for a User

Gets all existing clients for a User.

| GET /clients |
|--------------|

## Request

### Path Parameters

None

### Request Header

| **Field**     | **Description**                                                         | **Required?** |
|---------------|-------------------------------------------------------------------------|---------------|
| Accept        | The format of the content to be returned. Must be **application/json**. | Yes           |
| Authorization | A JSON Web token identifying the user.                                  | Yes           |

### Request Body

None

## Response

### Response Body Format

JSON

### Response Statuses

| **Outcome** | **Status Code**    | **Notes**                                                                                    |
|-------------|--------------------|----------------------------------------------------------------------------------------------|
| Success     | 200 OK             |                                                                                              |
| Failure     | 401 Unauthorized   | Request is missing credentials or credentials were invalid.                                  |
| Failure     | 403 Forbidden      | Request contains credentials for a user that does not have access privileges to this client. |
| Failure     | 404 Not Found      | No service with the given client_id exists.                                                  |
| Failure     | 406 Not Acceptable | Request content-type is not supported or is missing.                                         |

### Response Examples

#### Status: 200 OK

| {  "clients": [  {  "id": "456",  "name": "Real Games",  "contact_manager": "Theo Teeny",  "email": "theo_teeny@realgames.com",  "owner": "EPIC",  "services": [],  "self": "http://\<your-app\>/clients/456"  },  {  "id": "993",  "name": "CastleMorning",  "contact_manager": "Kim Library",  "email": "library_kim@castlemorning.com",  "owner": "EPIC",  "services": [],  "self": "http://\<your-app\>/clients/993"  },  {  "id": "95014",  "name": "Smapple",  "contact_manager": "Speve Bobs",  "email": "itsspeve@smapple.com",  "owner": "EPIC",  "services": [],  "self": "http://\<your-app\>/clients/95014"  },  {  "id": "30",  "name": "Warrioros",  "contact_manager": "Speve Perr",  "email": "perr_speve@warriors.com",  "owner": "EPIC",  "services": [],  "self": " http://\<your-app\>/clients/30"  },  {  "id": "467",  "name": "Exciting Company",  "contact_manager": "Belon Busk",  "email": "busk_belon@excitingcompany.com",  "owner": "EPIC",  "services": [],  "self": " http://\<your-app\>/clients/467"  }  ],  "next": "http://\<your-app\>/clients?cursor=...",  "items": 6 } |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

#### 

#### Status: 401 Unauthorized

| {  "Error": "The request object is missing credentials or credentials are invalid" } |
|--------------------------------------------------------------------------------------|

#### 

#### Status: 403 Forbidden

| {  "Error": "The user does not have access privileges to this client" } |
|-------------------------------------------------------------------------|

#### Status: 404 Not Found

| {  "Error": "No client with this client_id exists" } |
|------------------------------------------------------|

#### Status: 406 Not Acceptable

| {  "Error": "Client must accept application/json" } |
|-----------------------------------------------------|

# Replace a Client

Replaces an existing client with all new attribute values. The client retains any existing associations to a service and a user.

| PUT /clients/:client_id |
|-------------------------|

## Request

### Path Parameters

| **Name**  | **Type** | **Description**       | **Required?** |
|-----------|----------|-----------------------|---------------|
| client_id | string   | The id of the client. | Yes           |

### Request Body

Required

### Request Header

| **Field**     | **Description**                                                         | **Required?** |
|---------------|-------------------------------------------------------------------------|---------------|
| Accept        | The format of the content to be returned. Must be **application/json**. | Yes           |
| Authorization | A JSON Web token identifying the user.                                  | Yes           |

### Request Body Format

JSON

### Request JSON Attributes

| **Name**        | **Type** | **Description**               | **Required?** |
|-----------------|----------|-------------------------------|---------------|
| name            | string   | The client's name.            | Yes           |
| contact_manager | string   | The client's contact manager. | Yes           |
| email           | float    | The client's email.           | Yes           |

### Request Body Example

| {  "name": "Not Engine",  "contact_manager": "Tim Bweeny",  "email": "tim_bweeny@realgames.com", } |
|----------------------------------------------------------------------------------------------------|

## Response

### Response Body Format

JSON

### Response Statuses

| **Outcome** | **Status Code**            | **Notes**                                                                                                                                             |
|-------------|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| Success     | 201 Created                | Returns response body.                                                                                                                                |
| Failure     | 400 Bad Request            | Request is missing required parameters, using an unsupported attribute.                                                                               |
| Failure     | 401 Unauthorized           | Request is missing credentials or credentials were invalid.                                                                                           |
| Failure     | 403 Forbidden              | Request contains credentials of a user that does not have permission to access this client.  Client attempts to modify client_id, services, or owner. |
| Failure     | 404 Not Found              | No client with the given client_id exists.                                                                                                            |
| Failure     | 406 Not Acceptable         | Request content-type is not supported or is missing.                                                                                                  |
| Failure     | 415 Unsupported Media Type | Request Content-Type header is not supported or is missing.                                                                                           |

### Response Examples

#### Status: 201 Created

| {  "id": "456",  "name": "Not Engine",  "contact_manager": "Tim Bweeny",  "email": "tim_bweeny@realgames.com",  "owner": "EPIC",  "services": [  {  "id": "100",  "self": "http://\<your-app\>/services/100"  }  ],  "self": " http://\<your-app\>/clients/456" } |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

#### 

#### Status: 400 Bad Request

| {  "Error": "The request object is missing at least one of the required attributes" } |
|---------------------------------------------------------------------------------------|

#### 

| {  "Error": "The request object includes at least one unsupported attribute" } |
|--------------------------------------------------------------------------------|

#### 

#### Status: 401 Unauthorized

| {  "Error": "The request object is missing credentials or credentials are invalid" } |
|--------------------------------------------------------------------------------------|

#### Status: 403 Forbidden

| {  "Error": "The user does not have access privileges to this client" } |
|-------------------------------------------------------------------------|

| {  "Error": "client_id cannot be modified" } |
|----------------------------------------------|

| {  "Error": "owner cannot be modified" } |
|------------------------------------------|

| {  "Error": "services cannot be modified at this endpoint" } |
|--------------------------------------------------------------|

#### Status: 404 Not Found

| {  "Error": "No client with this client_id exists" } |
|------------------------------------------------------|

#### Status: 406 Not Acceptable

| {  "Error": "Client must accept application/json" } |
|-----------------------------------------------------|

#### Status: 415 Unsupported Media Type

| {  "Error": "Server only accepts application/json data" } |
|-----------------------------------------------------------|

# Update a Client

Updates one or more attributes of an existing client. The client retains any existing associations to a service and a user.

| PATCH /clients/:client_id |
|---------------------------|

## Request

### Path Parameters

| **Name**  | **Type** | **Description**       | **Required?** |
|-----------|----------|-----------------------|---------------|
| client_id | string   | The id of the client. | Yes           |

### Request Body

Required

### Request Header

| **Field**     | **Description**                                                         | **Required?** |
|---------------|-------------------------------------------------------------------------|---------------|
| Accept        | The format of the content to be returned. Must be **application/json**. | Yes           |
| Authorization | A JSON Web token identifying the user.                                  | Yes           |

### Request Body Format

JSON

### Request JSON Attributes

| **Name**        | **Type** | **Description**               | **Required?** |
|-----------------|----------|-------------------------------|---------------|
| name            | string   | The client's name.            | No            |
| contact_manager | string   | The client's contact manager. | No            |
| email           | float    | The client's email.           | No            |

### Request Body Example

| {  "contact_manager": "Simmothy Tweeny" } |
|-------------------------------------------|

## Response

### Response Body Format

JSON

### Response Statuses

| **Outcome** | **Status Code**            | **Notes**                                                                                                                                             |
|-------------|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| Success     | 200 OK                     | Returns response body.                                                                                                                                |
| Failure     | 400 Bad Request            | Request is parameters or includes an unsupported parameter.                                                                                           |
| Failure     | 401 Unauthorized           | Request is missing credentials or credentials were invalid.                                                                                           |
| Failure     | 403 Forbidden              | Request contains credentials of a user that does not have permission to access this client.  Client attempts to modify client_id, services, or owner. |
| Failure     | 404 Not Found              | No service with the given client_id exists.                                                                                                           |
| Failure     | 406 Not Acceptable         | Request content-type is not supported or is missing.                                                                                                  |
| Failure     | 415 Unsupported Media Type | Request Content-Type header is not supported or is missing.                                                                                           |

### Response Examples

#### Status: 200 OK

| {  "id": "456",  "name": "Not Engine",  "contact_manager": "Simmothy Tweeny",  "email": "tim_bweeny@realgames.com",  "owner": "EPIC",  "services": [  {  "id": "100",  "self": "http://\<your-app\>/services/100"  }  ],  "self": " http://\<your-app\>/clients/456" } |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

#### 

#### Status: 400 Bad Request

| {  "Error": "The request object must include at least one supported attribute" } |
|----------------------------------------------------------------------------------|

#### 

| {  "Error": "The request object includes at least one unsupported attribute" } |
|--------------------------------------------------------------------------------|

#### 

#### Status: 401 Unauthorized

| {  "Error": "The request object is missing credentials or credentials are invalid" } |
|--------------------------------------------------------------------------------------|

#### Status: 403 Forbidden

| {  "Error": "The user does not have access privileges to this client" } |
|-------------------------------------------------------------------------|

| {  "Error": "client_id cannot be modified" } |
|----------------------------------------------|

| {  "Error": "owner cannot be modified" } |
|------------------------------------------|

| {  "Error": "services cannot be modified at this endpoint" } |
|--------------------------------------------------------------|

#### Status: 404 Not Found

| {  "Error": "No client with this client_id exists" } |
|------------------------------------------------------|

#### Status: 406 Not Acceptable

| {  "Error": "Client must accept application/json" } |
|-----------------------------------------------------|

#### 

#### Status: 415 Unsupported Media Type

| {  "Error": "Server only accepts application/json data" } |
|-----------------------------------------------------------|

# Delete a Client

Deletes an existing Client. Note that if the client has any service, deleting the client will disassociate any service the client is associated with it.

| DELETE /clients/:client_id |
|----------------------------|

## Request

### Path Parameters

| **Name**  | **Type** | **Description**       | **Required?** |
|-----------|----------|-----------------------|---------------|
| client_id | string   | The id of the client. | Yes           |

### Request Body

None

### Request Header

| **Field**     | **Description**                        | **Required?** |
|---------------|----------------------------------------|---------------|
| Authorization | A JSON Web token identifying the user. | Yes           |

### Request Body Format

None

## Response

### Response Body Format

Success: None

Failure: JSON

### Response Statuses

| **Outcome** | **Status Code**  | **Notes**                                                                                   |
|-------------|------------------|---------------------------------------------------------------------------------------------|
| Success     | 204 No Content   |                                                                                             |
| Failure     | 401 Unauthorized | Request is missing credentials or credentials were invalid.                                 |
| Failure     | 403 Forbidden    | Request contains credentials of a user that does not have permission to access this client. |
| Failure     | 404 Not Found    | No service with the given client_id exists.                                                 |

### Response Examples

#### Status: 204 No Content

|   |
|---|

#### 

#### Status: 401 Unauthorized

| {  "Error": "The request object is missing credentials or credentials are invalid" } |
|--------------------------------------------------------------------------------------|

#### Status: 403 Forbidden

| {  "Error": "The user does not have access privileges to this client" } |
|-------------------------------------------------------------------------|

#### Status: 404 Not Found

| {  "Error": "No client with this client_id exists" } |
|------------------------------------------------------|

## 

# Assign a Service to a Client

Assigns a service to a client.

| PUT /clients/:client_id/services/:service_id |
|----------------------------------------------|

## Request

### Path Parameters

| **Name**   | **Type** | **Description**        | **Required?** |
|------------|----------|------------------------|---------------|
| client_id  | string   | The id of the client.  | Yes           |
| service_id | string   | The id of the service. | Yes           |

### Request Body

Required

### Request Header

| **Field**     | **Description**                        | **Required?** |
|---------------|----------------------------------------|---------------|
| Authorization | A JSON Web token identifying the user. | Yes           |

### Request Body Format

None

## Response

### Response Body Format

Success: None

Failure: JSON

### Response Statuses

| **Outcome** | **Status Code**  | **Notes**                                                                                                                                   |
|-------------|------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| Success     | 204 No Content   |                                                                                                                                             |
| Failure     | 401 Unauthorized | Request is missing credentials or credentials were invalid.                                                                                 |
| Failure     | 403 Forbidden    | Request contains credentials of a user that does not have permission to access this client. A Client is already associated to this service. |
| Failure     | 404 Not Found    | No client with the given client_id exists, and/or no service with the given service_id exists.                                              |

### Response Examples

#### Status: 204 No Content

|   |
|---|

#### Status: 401 Unauthorized

| {  "Error": "The request object is missing credentials or credentials are invalid" } |
|--------------------------------------------------------------------------------------|

#### Status: 403 Forbidden

| {  "Error": "The user does not have access privileges to this client" } |
|-------------------------------------------------------------------------|

| {  "Error": "The service already has a client" } |
|--------------------------------------------------|

#### Status: 404 Not Found

| {  "Error": "No client with this client_id exists, and/or no service with this service_id exists" } |
|-----------------------------------------------------------------------------------------------------|

# 

# Remove a Service from a Client

Removes a service from a client.

| DELETE /clients/:client_id/services/:service_id |
|-------------------------------------------------|

## Request

### Path Parameters

| **Name**   | **Type** | **Description**        | **Required?** |
|------------|----------|------------------------|---------------|
| client_id  | string   | The id of the client.  | Yes           |
| service_id | string   | The id of the service. | Yes           |

### Request Body

Required

### Request Header

| **Field**     | **Description**                        | **Required?** |
|---------------|----------------------------------------|---------------|
| Authorization | A JSON Web token identifying the user. | Yes           |

### Request Body Format

None

## Response

### Response Body Format

Success: None

Failure: JSON

### Response Statuses

| **Outcome** | **Status Code**  | **Notes**                                                                                      |
|-------------|------------------|------------------------------------------------------------------------------------------------|
| Success     | 204 No Content   |                                                                                                |
| Failure     | 401 Unauthorized | Request is missing credentials or credentials were invalid.                                    |
| Failure     | 403 Forbidden    | Request contains credentials of a user that does not have permission to access this client.    |
| Failure     | 404 Not Found    | No client with the given client_id exists, and/or no service with the given service_id exists. |

### Response Examples

#### Status: 204 No Content

|   |
|---|

#### 

#### Status: 401 Unauthorized

| {  "Error": "The request object is missing credentials or credentials are invalid" } |
|--------------------------------------------------------------------------------------|

#### Status: 403 Forbidden

| {  "Error": "The user does not have access privileges to this client" } |
|-------------------------------------------------------------------------|

#### Status: 404 Not Found

| {  "Error": "No client with this client_id exists, and/or no service with this service_id exists" } |
|-----------------------------------------------------------------------------------------------------|
