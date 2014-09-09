/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Source code from Ariya Hidayat made available under Public Domain
 * http://ariya.ofilabs.com/2012/02/from-double-quotes-to-single-quotes.html
 *
 * Contributors:
 *    Ken Walker
 *    Ariya Hidayat
 *******************************************************************************/

/*global define orion esprima window */
window.onload = function() {

    // create the plugin header
    var headers = {
        name: 'Double to Single Quotes Plugin',
        version: '0.1',
        description: 'Converts Double to Single Quotes in the Editor'
    };

    // Create the provider based on the headers
    var provider = new orion.PluginProvider(headers);
    
    // Create the service implementation for getting selected text
    var serviceImpl = {
        run: function(selectedText, text, selection) {
            var toFormat;
            var selectionEmpty = selection.start === selection.end;
            if (selectionEmpty) {
                toFormat = text;
            } else {
                toFormat = selectedText;
            }
            var offset = 0;
            var tokens = esprima.parse(toFormat, {
                tokens: true,
                range: true
            }).tokens;

            function convert(literal) {
                var result = literal.substring(1, literal.length - 1);
                result = result.replace(/'/g, '\\\'');
                return '\'' + result + '\'';
            }

            tokens.forEach(function(token) {
                var str;
                if (token.type === 'String' && token.value[0] !== '\'') {
                    str = convert(token.value);
                    toFormat = toFormat.substring(0, offset + token.range[0]) + str + toFormat.substring(offset + token.range[1] + 1, toFormat.length);
                    offset += (str.length - token.value.length);
                }
            });
            if (selectionEmpty) {
                return {
                    text: toFormat
                };
            } else {
                return toFormat;
            }
        }
    };

    // Define the properties for this service, the button will appear with the name and hover help
    var serviceProperties = {
        name: 'D2S',
        tooltip: 'Convert Double Quotes to Single Quotes',
        key: ['D', true, true] // Ctrl+Shift+D
    };

    // Register the Double to Single service
    provider.registerServiceProvider('orion.edit.command', serviceImpl, serviceProperties);
    provider.connect();
};