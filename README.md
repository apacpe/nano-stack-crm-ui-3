# nano-stack-crm-ui-3
# Nano Stack Developer Training - CRM UI Extensions
The following are instructions to create a custom CRM UI card and deploy it to HubSpot. The CRM UI card will be built with React and Node.js. 

## Add a serverless function to your extension
### Setting up the API client 
1. Open serverless.json in your code editor and define the API client

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

5. On the serverless.json file, instantiate the client that calls the endpoint 
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
1. In the Custom.jsx file, declare the `addAlert` method within the actions object and set the _workflowId_ variable with the ID of your chosen workflow 
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
    const { response, status, message, workflowId } = await runServerless({
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
