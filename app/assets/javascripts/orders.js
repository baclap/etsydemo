/*
WORTH EXPLAINING TO START OFF...

  $(document).on('ready', function() {
    // code to execute goes here
  });

This is the standard way in jQuery to execute code as soon as the DOM
has completely loaded. You will often see the shorthand version which
looks like this:

  $(function(){
    // code to execute goes here
  })

For our purpose I'm using the long version and adding the page:load
event in addition to the ready event. The page:load event is a custom
event fired by turbolinks meant for use in situations such as this.
Using it this way ensures that the javascript loads every time without
having to disable turbolinks.

-----

Here is a solid explanation of DOM ready taken from stackoverflow:
http://stackoverflow.com/questions/12637725/what-is-dom-ready-event

  "DOM ready means that all the HTML has been received and
  parsed by the browser into the DOM tree which can now be
  manipulated.

  It occurs before the page has been fully rendered (as external
  resources may have not yet fully downloaded - including images,
  CSS, JavaScript and any other linked resources)."

*/

// run the contained code when the ready or page:load event of document is fired (i.e. when the page loads)
$(document).on('ready page:load', function() {
  // use jQuery to retrieve the stripe meta tag we added to application.html.erb file
  // set the stripe_key variable to the value of that meta tag's content attribute
  var stripe_key = $('meta[name=stripe-key]').attr('content');

  // execute the Stripe javascript object's setPublishableKey method, passing in our stripe key as the parameter
  Stripe.setPublishableKey(stripe_key);

  // execute the setupForm method from our javascript object defined below
  Payment.setupForm();
});

// create a javascript object
Payment = {

  // define a function of this object (functions of objects are called methods, hence my use of "method" in the comments above)
  setupForm: function(){
    // use jQuery to retrieve the HTML element on the page with an id of "new_order", in our case this is the <form> element containing our order form
    // this instantiates a jQuery object for the element
    // set that object to a variable so we can use it again later without having to retrieve it again (a.k.a. caching)
    // using the $ at the beginning of this variable is not at all required, it is simply a convention for letting you know it is a jQuery object
    var $new_order = $('#new_order');

    // with jQuery you'll often see this type of thing, sometimes it is .click, .hover, or .dblclick (many more) instead of .submit
    // what it means is that when the associated javascript event is fired on the element execute the contained function
    // in this case, when the form is submitted and the submit event is fired execute this function before letting the browser perform its default behavior
    $new_order.submit(function(){
      // retrieve the form's submit button using jQuery and disable it
      $('input[type=submit]').attr('disabled', true);
      // execute the createToken method of the card object which is an attribute of the Stripe object (a nested object)
      // the second paramater is our callback function, meaning this function will call that function when it's completed
      Stripe.card.createToken($new_order, Payment.handleStripeResponse);
      // by ending our function with return false we instruct the browser not to continue with submitting the form
      return false;
    });

  },

  // define another function of this object
  // this function accepts 2 parameters which are then used by the function
  // Alex knew how to structure this function because of the Stripe documentation (https://stripe.com/docs/stripe.js#card-createToken)
  handleStripeResponse: function(status, response) {
    // check the value of the first parameter given which is an HTTP status code (http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html)
    if (status == 200) { // 200 = OK
      // get the form by its id using jQuery and cache it in the $new_order variable
      var $new_order = $('#new_order');
      // add a hidden input to the form with the response.id as its value
      // because the name attribute is set to "stripeToken" we use params[:stripeToken] to retrieve this info in our orders controller
      $new_order.append($('<input type="hidden" name="stripeToken" />').val(response.id));
      // submit the form
      // wish I could really explain why the [0] is needed... I basically just know that it is needed
      $new_order[0].submit();
    } else {
      // get our Stripe error div by its id and replace the text in it with the error message
      $('#stripe_error').text(response.error.message).show();
      // re-enable the submit button
      $('input[type=submit]').attr('disabled', false);
    }

  }

}
