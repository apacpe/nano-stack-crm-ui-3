# nano-stack-crm-ui-3
# Nano Stack Developer Training - CRM UI Extensions
The following are instructions to create a custom CRM UI card and deploy it to HubSpot. The CRM UI card will be built with React and Node.js. 

## Add a serverless function to your extension
### Setting up the API client 
1. Open custom-function.js in your code editor and define the API client

```
const hubspot = require('@hubspot/api-client');
```

2. Create a serverless function and define the variables needed to run the endpoint

```
exports.main = async (context = {}) => {

  const { email } = context.propertiesToSend;
  const { workflowId } = context.parameters;
 
  const token = process.env['PRIVATE_APP_ACCESS_TOKEN'];
  const hsClient = new hubspot.Client({ accessToken: token });

};
```

3. Navigate to the "Auth" tab of the private app that your extension is deployed to and copy the access token. 

4. Using your terminal, save your access token using `hs secrets add PRIVATE_APP_ACCESS_TOKEN`. When prompted, paste the access token that you've copied into the terminal. 

5. On the custom-function.js file, instantiate the client that calls the endpoint 
```
try {
    hsClient.apiRequest({
      method: 'POST',
      path: '/automation/v2/workflows/'+ workflowId + '/enrollments/contacts/'+ email,
      body: { email: email },
  })
  return ('Contact has been enrolled in workflow ID ' + workflowId);

  } catch (err) {
    // Handle API call error
    console.error('api call falled because:',err);
  }
```
### Configure the FE with a button that runs the serverless function 
1. In the Custom.jsx file, declare the `addAlert` method within the actions object and set the `workflowId` variable with the ID of your chosen workflow. Note that we're using the **workflowId**, not flowId.  
```
const workflowId = [your workflow id];
const {
    onCrmPropertiesUpdate,
    fetchCrmObjectProperties,
    addAlert
  } = actions;
``` 

2. And a button within the return statement of the React component  
```
{revenueCount > 1000 &&
        <Button type="submit" onClick={handleClick} >
          Enroll in workflow {workflowId}</Button>
      }
```

3. As well as an event handler that triggers the serverless function
```
  const handleClick = async () => {
    const workflowId = [your workflow id];
    const { response, status, message } = await runServerless({
      name: "customFunc", propertiesToSend: ['email'], parameters: {workflowId}
    });
    if (status == 'SUCCESS') {
      addAlert({ message: response, type: "success" });
    }
    else {
      console.error("Error executing 'api call falled because:", message);
    }
  };
```    
### Deploy changes to HubSpot

1. Upload your updated files to your HubSpot project with `hs project upload --account=[your account id]`

2. Navigate to a contact record and update the _No of Users_ and/or _Price per user_ properties such that the Expected revenue is more than 1000. You should see a button appear that allows the user to enroll the contact in a workflow. Click on the button and check if the contact is enrolled in your chosen workflow. 
---
Refer to [this resource](https://docs.google.com/document/d/158lC7iaTETgKKQVDs4rdOBRZ_9vSUIBIlpByFh0b_4o/edit#heading=h.gzn6elt46xf7) to troubleshoot common errors encountered during this session. 

---
## BONUS expansion pack (credits to @antomanto)
### Call an additional endpoint in your extension that converts flowId to workflowId  
1. In the Custom.jsx file, rename the _workflowId_ variable to `flowId` and store the **flowId** of your chosen workflow in this variable.
```
const flowId = [your workflow's flow id]; // eg. 579598703 is the flowId from the URL: https://app.hubspot.com/workflows/4718896/platform/flow/579598703/edit
```
2. In the custom-function.js file, add the following code within the exports.main function, before the existing api call to enroll the contact in the workflow
```
    const response = await hsClient.apiRequest({
            method: 'GET',
            path:'/automation/v3/workflows/',
        })
    const json = await response.json();
    const workflowResponse = json.workflows;

    for (const workflowOutput of workflowResponse) { //iterates through the workflows array
        if ('migrationStatus' in workflowOutput) { 
            const checkIfFlowMatches = workflowOutput.migrationStatus.flowId; //returns number that corresponds with the flowId that we want to check against
            if (checkIfFlowMatches == flowId) {
                var updatedFlowId = workflowOutput.migrationStatus.workflowId; //sets the proper workflowId that is compatible with the v2 workflows endpoint
            } else {
                return "no match found"
            }
        } else {
            return null;
        }
    }
```
3. Update the variable used in the v2/workflows api call used to enroll the contact in the workflow. This is how your custom-function.js file should look like

```
const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {

    const { email } = context.propertiesToSend;
    const { workflowId } = context.parameters; //returns number type
   
    const token = process.env['PRIVATE_APP_ACCESS_TOKEN'];
    const hsClient = new hubspot.Client({ accessToken: token });
    
    const response = await hsClient.apiRequest({
            method: 'GET',
            path:'/automation/v3/workflows/',
        })
    const json = await response.json();
    const workflowResponse = json.workflows;

    for (const workflowOutput of workflowResponse) { //iterates through the workflows array
        if ('migrationStatus' in workflowOutput) { 
            const checkIfFlowMatches = workflowOutput.migrationStatus.flowId; //returns number that corresponds with the flowId that we want to check against
            if (checkIfFlowMatches == flowId) {
                var updatedFlowId = workflowOutput.migrationStatus.workflowId; //sets the proper workflowId that is compatible with the v2 workflows endpoint
            } else {
                return "no match found"
            }
        } else {
            return null;
        }
    }
    
    try {
        hsClient.apiRequest({
          method: 'POST',
          path: '/automation/v2/workflows/'+ updatedFlowId + '/enrollments/contacts/'+ email,
          body: { email: email },
      })
      return ('Contact has been enrolled in workflow ID ' + flowId + ' this corresponds with the old workflow ID: ' + updatedFlowId);
    
      } catch (err) {
        // Handle API call error
        console.error('api call falled because:',err);
      }
  };
```
#### How does this work?
Here is a quick walkthrough to help you build an understanding of the code snippets used in the BONUS section: 
1. Run the automation/v3/workflows in API Goggles using [this endpoint](https://tools.hubteam.com/api/request/bb9fb178a38a4e158b28465b806b0fa4) with your portal ID and review the contents of the JSON reponse. When your extension runs this endpoint, the response is stored in the `json` variable.
2. Observe how the response in API Goggles is nested within the `workflows` array object. The contents within this `workflows` array object are stored in the `workflowResponse` variable through the use of [dot notation](https://frontend.turing.edu/lessons/module-1/js-dot-bracket-notation.html#:~:text=Dot%20Notation%20A%20property%20in%20an%20object%20is%20accessed%20by%20giving%20the%20object%E2%80%99s%20name%2C%20followed%20by%20a%20period%2C%20followed%20by%20the%20property%20name%20(Example%3A%20user.name))  
3. The next part of the code snippet is a [for...of statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) that loops through the `workflows` array object. For each workflow, the flowId is stored in the `checkIfFlowMatches` variable which is then checked against the `flowId` variable declared in the Custom.jsx file.
4. When a match is found (i.e. `checkIfFlowMatches == flowId`), the **workflowId** of the matched workflow is stored in the `updatedFlowId` variable. This variable is then used in the v2/workflows api call used to enroll the contact in the workflow
