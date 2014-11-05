$(document).on('ready page:load', function() {
  var stripe_key = $('meta[name=stripe-key]').attr('content');
  Stripe.setPublishableKey(stripe_key);
  Listing.setupForm();
});

Listing = {
  setupForm: function(){
    if ($('.bank-info').length) {
      var $new_listing = $('#new_listing');
      $new_listing.submit(function(){
        $('input[type=submit]').attr('disabled', true);
        Stripe.bankAccount.createToken($new_listing, Listing.handleStripeResponse);
        return false;
      });
    }
  },
  handleStripeResponse: function(status, response) {
    if (status == 200) { // 200 = OK
      var $new_listing = $('#new_listing');
      $new_listing.append($('<input type="hidden" name="stripeToken" />').val(response.id));
      $new_listing[0].submit();
    } else {
      $('#stripe_error').text(response.error.message).show();
      $('input[type=submit]').attr('disabled', false);
    }
  }
}
