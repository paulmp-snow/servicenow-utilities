/**
 * Name: CustomCartAPI
 * Accessible from: All application scopes (set in SI record)
 * Client callable: No (server-side only)
 *
 * Purpose:
 *  - Wraps the OOTB Cart API while allowing the caller to override the 'requested_for' on the cart.
 *  - Preserves use of GlideappCart and GlideappCatalogItem.
 *
 * Usage:
 *  var cart = new CustomCartAPI('Default', gs.getUserID(), someUserSysId);
 *  var cartItemId = cart.addItem('e.g. ci_sys_id', 2, 'optional_og_sys_id');
 *
 * Notes:
 *  - initialize() clears the cart to start fresh (mirrors your original). Remove that line if you want to keep existing items.
 */
var CustomCartAPI = Class.create();
CustomCartAPI.prototype = Object.extendsObject(Cart, {
    initialize: function (cartName, userID, reqBy) {
        // mirror original defaults to null
        this.cartName = cartName || null;
        this.userID   = userID   || null;
        this.reqBy    = reqBy    || null;

        // Retrieve/prepare the cart record (sc_cart GlideRecord)
        this.cart = this._getCartRecord();

        // Keep original behavior: start with an empty cart
        this.clearCart();
    },

    /**
     * Internal: fetches the underlying sc_cart GlideRecord via GlideappCart.
     * If reqBy is provided, sets requested_for and updates the cart.
     * Returns: sc_cart GlideRecord
     */
    _getCartRecord: function () {
        var appCart = GlideappCart.getCartForRhino(this.cartName, this.userID);
        var cartGR  = appCart.getGlideRecord();

        // Only touch requested_for when explicitly provided
        if (!gs.nil(this.reqBy)) {
            try {
                // Optional: light validation that the user exists
                var u = new GlideRecord('sys_user');
                if (u.get(this.reqBy)) {
                    cartGR.setValue('requested_for', this.reqBy);
                    cartGR.update(); // enforce the update
                } else {
                    gs.warn('[CustomCartAPI] requested_for user not found: ' + this.reqBy);
                }
            } catch (e) {
                gs.error('[CustomCartAPI] Failed setting requested_for: ' + e.message);
            }
        }

        return cartGR; // return the sc_cart GlideRecord
    },

    /**
     * Adds an item to the cart (mirrors your logic).
     * Parameters:
     *   itemID (sys_id of sc_cat_item), quantity (defaults to 1), orderGuide (optional sys_id)
     * Returns:
     *   sys_id of sc_cart_item or null on failure
     */
    addItem: function (itemID, quantity, orderGuide) {
        if (typeof quantity === 'undefined' || quantity === null || quantity === '') {
            quantity = 1;
        }

        var catItem = GlideappCatalogItem.get(itemID);
        if (catItem == null) {
            gs.warn('[CustomCartAPI] Item does not exist: ' + itemID);
            return null;
        }

        var gr = new GlideRecord('sc_cart_item');
        gr.initialize();
        gr.cart     = String(this.cart.sys_id);
        gr.cat_item = String(itemID);
        gr.quantity = parseInt(quantity, 10);

        if (!gs.nil(orderGuide)) {
            gr.order_guide   = String(orderGuide);
            // retain your custom field behavior
            gr.u_order_guide = String(orderGuide);
        }

        var cartItemId = gr.insert();

        // Leverage Cart API to prep variables (as in original)
        this.prepVariables(itemID, cartItemId);

        return cartItemId;
    },

    type: 'CustomCartAPI'
});
