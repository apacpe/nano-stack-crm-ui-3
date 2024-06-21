# nano-stack-crm-ui-3
# Nano Stack Developer Training - CRM UI Extensions
The following are instructions to create a custom CRM UI card and deploy it to HubSpot. The CRM UI card will be built with React and Node.js. 

## Serverless functions for your extension
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

3. Using your terminal, save your access token 

```
"customFunc": {
      "file": "custom-function.js",
      "secrets": []
    }
```

4. In your terminal, navigate to the extensions folder 

5. Install the HubSpot UI extensions npm package in the extensions folder by running `npm i @hubspot/ui-extensions`

6. Create a new file called Custom.jsx in the extensions folder with `touch Custom.jsx`

7. Import these components at the top of the file

```
import React, { useState, useEffect } from 'react';
import { Statistics, StatisticsItem, Text, hubspot, Button } from '@hubspot/ui-extensions';
import { CrmPropertyList } from '@hubspot/ui-extensions/crm';
```

### Use the CrmPropertyList component in your UI extension

1. Define your extension in the Custom.jsx file 

```
// Define the extension to be run within the Hubspot CRM
hubspot.extend(({ context, runServerlessFunction, actions }) =>
  <PropList context={context} runServerless={runServerlessFunction} actions={actions} />);

// Define the Extension component, taking in runServerless prop
const PropList = ({ context, runServerless, actions }) => {

  return (
      <CrmPropertyList
        properties={[
          'lastname',
          'email',
          'price_per_user',
          'no_of_users',
        ]}
        direction="row"
      />
  );
};

``` 

2. Upload your updated files to your HubSpot project with `hs project upload --account=[your account id]`

3. Follow [these steps](https://knowledge.hubspot.com/object-settings/customize-the-middle-column-of-records#edit-the-middle-column-s-layout-and-content) to Customize your CRM display to add the newly created CRM UI card to the middle column of your contact records. When adding the new card to your contact record, the card will be labelled  "Qualifying Call card". 

4. Navigate to a contact record and check that you're able to see the "Qualifying Call card". You should be able to edit the selected contact properties in your new CRM card. 

### Calculate "Expected revenue" using the values of two properties
1. In the Custom.jsx file, have your UI extension return a Statistics component to contain your calculated value
```
<Statistics>
        <StatisticsItem label="Expected revenue" number={revenueCount}>
          <Text>No of users x Price per user</Text>
        </StatisticsItem>
      </Statistics>
```

2. Add a state variable for _revenueCount_ and register the _onCrmPropertiesUpdate_ and _fetchCrmObjectProperties_ methods in the PropList component 

```
const [revenueCount, setRevenueCount] = useState(0);
 const {
    onCrmPropertiesUpdate,
    fetchCrmObjectProperties,
  } = actions;

```
3. Write 2 functions that take in contact properties as the input and return an update to the _revenueCount_ state variable 

```
  onCrmPropertiesUpdate(['no_of_users', 'price_per_user'], (properties) => {
    console.log('prop-update', properties);
    setRevenueCount(parseFloat(properties.no_of_users) * parseFloat(properties.price_per_user));
  });

  fetchCrmObjectProperties(['no_of_users', 'price_per_user']).then(properties => {
    console.log('prop-fetch', properties);
    setRevenueCount(parseFloat(properties.no_of_users) * parseFloat(properties.price_per_user));
  });
```
    
### Deploy changes to HubSpot

1. Upload your updated files to your HubSpot project with `hs project upload --account=[your account id]`

2. Navigate to a contact record and update the value of both properties. You should see the "Expected revenue" value update instantly.
---
Refer to [this resource](https://docs.google.com/document/d/158lC7iaTETgKKQVDs4rdOBRZ_9vSUIBIlpByFh0b_4o/edit#heading=h.gzn6elt46xf7) to troubleshoot common errors encountered during this session. 
