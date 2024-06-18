const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {

  const { email } = context.propertiesToSend;
  const { workflowId } = context.parameters;
  console.log('context', context);
  const token = process.env['PRIVATE_APP_ACCESS_TOKEN'];
  const hsClient = new hubspot.Client({ accessToken: token });
  console.log('inputs',email,workflowId)
  //enroll contact
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


};