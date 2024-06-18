import React, { useState, useEffect } from 'react';
import { Statistics, StatisticsItem, Text, hubspot, Button } from '@hubspot/ui-extensions';
import { CrmPropertyList } from '@hubspot/ui-extensions/crm';

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({ context, runServerlessFunction, actions }) =>
  <PropList context={context} runServerless={runServerlessFunction} actions={actions} />);

// Define the Extension component, taking in runServerless prop
const PropList = ({ context, runServerless, actions }) => {
  const [revenueCount, setRevenueCount] = useState(0);
  const workflowId = 60295256;
  const {
    onCrmPropertiesUpdate,
    fetchCrmObjectProperties,
    addAlert
  } = actions;

  onCrmPropertiesUpdate(['no_of_users', 'price_per_user'], (properties) => {
    console.log('prop-update', properties);
    setRevenueCount(parseFloat(properties.no_of_users) * parseFloat(properties.price_per_user));
  });

  fetchCrmObjectProperties(['no_of_users', 'price_per_user']).then(properties => {
    console.log('prop-fetch', properties);
    setRevenueCount(parseFloat(properties.no_of_users) * parseFloat(properties.price_per_user));
  });


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


  return (
    <>
      <CrmPropertyList
        properties={[
          'lastname',
          'email',
          'price_per_user',
          'no_of_users',
        ]}
        direction="row"
      />
      <Statistics>
        <StatisticsItem label="Expected revenue" number={revenueCount}>
          <Text>No of users x Price per user</Text>
        </StatisticsItem>
      </Statistics>
      {revenueCount > 1000 &&
        <Button type="submit" onClick={handleClick} >
          Enroll in workflow {workflowId}</Button>
      }
    </>
  );
};

