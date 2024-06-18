# nano-stack-crm-ui-2
# Nano Stack Developer Training - CRM UI Extensions
The following are instructions to create a custom CRM UI card and deploy it to HubSpot. The CRM UI card will be built with React and Node.js. 

## Create a new CRM UI extension
### Set up files for your new extension 
1. Open app.json in your code editor and make the following edits 

```
"scopes": [
    "crm.objects.contacts.read",
    "crm.objects.contacts.write",
    "automation"
  ],
  "public": false,
  "extensions": {
    "crm": {
      "cards": [
        {
          "file": "extensions/example-card.json"
        },
        {
          "file": "extensions/custom-card.json"
        }
      ]
```

2. Create a new file called custom-card.json in the extensions folder and set up your new card configuration

```
{
  "type": "crm-card",
  "data": {
    "title": "Qualifying Call Card",
    "uid": "qualifying_call_card",
    "location": "crm.record.tab",
    "module": {
      "file": "Custom.jsx"
    },
    "objectTypes": [
      {
        "name": "contacts"
      }
    ]
  }
}
```

3. Open serverless.json and configure a function for your new CRM extension

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

### Add a calculation using the values of two properties
1. In the Custom.jsx file, have your UI extension return a Statistics component to contain your calculated value
```
<Statistics>
        <StatisticsItem label="Expected revenue" number={revenueCount}>
          <Text>No of users x Price per user</Text>
        </StatisticsItem>
      </Statistics>
```

2. Add a state variable for revenueCount and register the _onCrmPropertiesUpdate_ and _fetchCrmObjectProperties_ methods in the PropList component 

```
const [revenueCount, setRevenueCount] = useState(0);
 const {
    onCrmPropertiesUpdate,
    fetchCrmObjectProperties,
  } = actions;

```
3. 

### Deploy changes to HubSpot

1. Open the Example.jsx file in a code editor program and edit the HTML
2. Upload your updated files with `hs project upload --account=[your account id]`
3. Review the changes on your CRM

---
Refer to [this resource](https://docs.google.com/document/d/158lC7iaTETgKKQVDs4rdOBRZ_9vSUIBIlpByFh0b_4o/edit#heading=h.gzn6elt46xf7) to troubleshoot common errors encountered during this session. 
