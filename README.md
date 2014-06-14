Mantis-request
==============

Mantis request library is a client-side library for issuing HTTP requests.

```javascript

requestHTTP()
  .POST('/login', 'application/json')
  .withHeader('authorization', 'Bearer oiwejfiowfejoiefjwef')
    .and('authorization, 'oiewjfiowejf')
  .withQueryParam('email', 'tingan87@gmail.com')
    .and('firstname', 'Tingan')
    .and('lastname', 'Ho')
  .whenSucceded(function(response) {

  })
  .whenFailed(function(reason, details) {

  });

```
