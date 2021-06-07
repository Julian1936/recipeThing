
jQuery(document).ready(function(){
    jQuery.ajax({
        url: "http://18.130.116.85/recipes",
        type: "POST",
        dataType: "json",
        success: function(data) {
            var recipe = data[4];
            console.log(recipe);
            var servings = recipe.servings;

            // Add the Recipe name to both the H1 on the page and the current item breadcrumb
            jQuery('#recipe-name, li.current-item').html(recipe.name);

            // Adds a data attribute for the current servings so we can use it later in our calculation
            jQuery('input#servings').attr('data-servings', servings);

            // Go through each ingredient element and create a list item then append it to the ingredients ul
            jQuery.each(recipe.ingredients, function(i, item) {
                // This element regarding the quanity is a work around due to the data being incomplete or wrong. for example there are some elements where the description is listed as 4 and the quantity data element is listed as 2. This tries to obtain the fraction from the description and then convert it to a decimal so that it can be used for calculation however this is also broken in some instances. It would be useful to discuss consistency with the API Author
                var quantity = quanityWorkAround(item.display);
                quantity = item.display.replace(/[a-z]/gi,'');
                quantity = quantity.replace('-', '');
                quantity = quantity.replace('.', '');
                quantity = quantity.replace(',', '');
                quantity = quantity.trim();
                quantity = quantity.replace(' ', '+');
                quantity = eval(quantity);
                quantity = Math.round(quantity * 4) / 4;
                jQuery('#ingredient-list').append('<li data-quantity="'+quantity+'"><span class="quantity-wrap"><span class="quantity">'+quantity+'</span> '+item.unit+'</span><br/><span class="ingredient-name">'+item.name+'</span></li>');
            });

            // Go through each instruction and then create a list item and append it to the method list
            counter = 1;
            jQuery.each(recipe.instructions, function(i, item) {
                jQuery('#method-list').append('<li>'+counter+'.<br/>'+item.text+'</li>');
                counter++;
            });
        },
    });

    // This moves the ingredient list from the aside to the main content when the window inner width is less that 769px
    if (window.innerWidth < 769) {	
        jQuery('.ingredients').insertAfter('.recipe-calculator');
    }
    jQuery(window).resize(function(){
        if(window.innerWidth < 769) { 
            jQuery('.ingredients').insertAfter('.recipe-calculator');
        } else {
            jQuery('.ingredients').appendTo('.main-content aside');
        }
    });

    // Calculation on button click
    jQuery('#calculate-servings').click(function(){

        // This gets the new value from the #servings input box
        var newServings = jQuery('#servings').val();

        // This gets the servings data attribute that we gave it earlier on
        var oldServings = jQuery('#servings').data('servings');

        // Now we go through each item and take the old quantity via a data attribute, then it is divided by the original serving amount then multipled by the new servings inputed. I rounded the amounts to the nearest quarter because this would be easier to read than 2.66666665 (2 2/3) for example.
        jQuery('#ingredient-list li').each(function(){
            var oldQuantity = jQuery(this).data('quantity');
            var newQuantity = (oldQuantity/oldServings) * newServings;
            jQuery(this).find('span.quantity').text((Math.round(newQuantity * 4) / 4));
        });
    });
});