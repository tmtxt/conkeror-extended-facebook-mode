/* conkeror-extended-facebook-mode
   Conkeror Extended Facebook Mode
*/

////////////////////////////////////////////////////////////////////////////////
// Include library
require("facebook"); // the default Conkeror's Facebook mode

// Avoid polluting global variables
var cefm = {};

////////////////////////////////////////////////////////////////////////////////
// Fallthrough keys for Facebook shortcut keys
define_key(facebook_keymap, "j", null, $fallthrough);
define_key(facebook_keymap, "k", null, $fallthrough);
define_key(facebook_keymap, "return", null, $fallthrough);
define_key(facebook_keymap, "q", null, $fallthrough);
define_key(facebook_keymap, "/", null, $fallthrough);
define_key(facebook_keymap, "l", null, $fallthrough);
define_key(facebook_keymap, "m", null, $fallthrough);
define_key(facebook_keymap, "c", null, $fallthrough);
define_key(facebook_keymap, "p", null, $fallthrough);
define_key(facebook_keymap, "o", null, $fallthrough);

////////////////////////////////////////////////////////////////////////////////
// Variables used
// Selectors
cefm.selectors = {};
// Selected story
cefm.selectors.selectedStory = [".selectedStorySimple", "._5gxh", "._5qdv"];

var cefm_conversation_not_found_message
  = "Cannot find conversation div";
var cefm_no_active_conversation_message
  = "No active conversations. Press q to find a friend to chat.";
var cefm_no_focused_conversation_message
  = "No focused conversation. Focus on one conversation first";
var cefm_scroll_gap = 50;

////////////////////////////////////////////////////////////////////////////////
// Some functions needed for the mode
/**
 * Click on the button with the input css selector
 * @param selector - The css selector of the button
 * @param button_name - The name of the button, can be any name that you like
 * @param I - The I object of the interactive command
 */
cefm.clickButton = function (I, selector, buttonName){
  var document = I.buffer.document;
  var button = document.querySelector(selector);
  if (button !== null) {
	  dom_node_click(button);
    I.minibuffer.message("Button " + buttonName + " clicked");
  } else {
	  I.minibuffer.message("Cannot find " + buttonName + " button");
  }
};

/**
 * Check if the focus is on any conversations or not
 * @param document - The document object of the current buffer (I.buffer.document)
 */
cefm.isFocusOnConversation = function (I){
  var activeElement = I.buffer.document.activeElement;
  if(activeElement.classList.contains("_552m")){
	  return true;
  } else {
	  return false;
  }
};

/**
 * Finding the conversation <div> that is nth-level parent of the active element
 * @param document - The document object of the current buffer (I.buffer.document)
 * @return Returns the conversation <div> object if it's found, otherwise, returns null
 */
function cefm_find_conversation_div(document){
  var activeElement = document.activeElement;
  // find the conversation div that is nth-level parent of the active element
  var p = activeElement.parentNode;
  while(p!=document){
	  if(p.classList.contains("_50-v")
	     && p.classList.contains("fbNub")
	     && p.classList.contains("_50mz")){
	    break;
	  } else {
	    p = p.parentNode;
	  }
  }
  // check if it can find
  if(p == document){
	  return null;
  } else {
	  return p;
  }
}

/**
 * Find the conversation <div> arrays (all the conversation <div> inside the page)
 * @param document - The document object of the current buffer (I.buffer.document)
 * @return Returns the conversation <div> array there are any conversation <div> exists, otherwise, returns null
 */
function cefm_find_conversation_div_array(document){
  var conversationDiv = document.querySelectorAll("._50-v.fbNub._50mz");
  if(conversationDiv.length == 0){
	  return null;
  } else {
	  return conversationDiv;
  }
}

/**
 * Find the <textarea> array that contains all the <textarea>s inside the conversation <div>
 * @param document - The document object of the current buffer (I.buffer.document)
 */
function cefm_find_conversation_textarea_array(document){
  return document.querySelectorAll("._552m");
}

/**
 * Cycle through conversations
 * @param I - The I object of the interactive command
 */
function cefm_cycle_through_conversations(I){
  // get the document object
  var document = I.buffer.document;

  // query the div(s) that contain the chat conversations and the textareas for
  // typing chat message
  var conversationDiv;
  var conversationTextareas = cefm_find_conversation_textarea_array(document);

  // check if there are any active conversations
  if((conversationDiv = cefm_find_conversation_div_array(document)) != null){
	  // check if the focus is on any conversation or not
	  if(cefm.isFocusOnConversation(I)){
	    // find the conversation div that is nth-level parent of the active
	    // element
	    var p;
	    if((p = cefm_find_conversation_div(document)) == null){
		    I.minibuffer.message(cefm_conversation_not_found_message);
	    } else {
		    // loop through the conversationDiv to find the match div tag
		    for(var i=0; i<conversationDiv.length; i++){
		      if(p.isEqualNode(conversationDiv[i])){
			      // focus on the next, if it's the end of array, focus on the first
			      if(i == conversationDiv.length - 1){
			        // end of array, focus on the first
			        conversationTextareas[0].focus();
			      } else {
			        // focus on the next
			        conversationTextareas[i+1].focus();
			      }
		      }
		    }
	    }
	  } else {
	    // focus on the first
  	  conversationTextareas[0].focus();
	  }
  } else {
	  I.minibuffer.message(cefm_no_active_conversation_message);
  }
}

/**
 * Attach Image to the current conversation
 * @param I - The I object of the interactive command
 */
function cefm_attach_image_to_conversation(I){
  // get the document buffer
  var document = I.buffer.document;

  // query the div(s) that contain the chat conversations and the textareas for
  // typing chat message
  var conversationDiv;
  var conversationTextareas = cefm_find_conversation_textarea_array(document);

  // check if there are any active conversations
  if((conversationDiv = cefm_find_conversation_div_array(document)) != null){
	  // check if the focus is on any conversation or not
	  if(cefm.isFocusOnConversation(I)){
	    // find the conversation div that is nth-level parent of the active
	    // element
	    var p;
	    if((p = cefm_find_conversation_div(document)) == null){
		    I.minibuffer.message(cefm_conversation_not_found_message);
	    } else {
		    // query the div that is the button to open file selector
		    var select_file_div = p.querySelector("._5f0v");
        dom_node_click(select_file_div);
	    }
	  } else {
	    I.minibuffer.message(cefm_no_focused_conversation_message);
	  }
  } else {
	  I.minibuffer.message(cefm_no_active_conversation_message);
  }  
}

/**
 * Scroll current chat conversation
 * @param I - The I object of the interactive command
 * @param scroll_gap - The gap to scroll (positive for down, negative for scroll up)
 */
function cefm_scroll_current_conversation(I, scroll_gap){
  // get the document buffer
  var document = I.buffer.document;

  // query the div(s) that contain the chat conversations and the textareas for
  // typing chat message
  var conversationDiv;
  var conversationTextareas = cefm_find_conversation_textarea_array(document);

  // check if there are any active conversations
  if((conversationDiv = cefm_find_conversation_div_array(document)) != null){
	  // check if the focus is on any conversation or not
	  if(cefm.isFocusOnConversation(I)){
	    // find the conversation div that is nth-level parent of the active
	    // element
	    var p;
	    if((p = cefm_find_conversation_div(document)) == null){
		    I.minibuffer.message(cefm_conversation_not_found_message);
	    } else {
		    // query the body of the chat (the scrollable part)
		    var chat_body = p.querySelector(".fbNubFlyoutBody");
		    // scroll to top
		    chat_body.scrollTop = chat_body.scrollTop + scroll_gap;
	    }
	  } else {
	    I.minibuffer.message(cefm_no_focused_conversation_message);
	  }
  } else {
	  I.minibuffer.message(cefm_no_active_conversation_message);
  }  
}

/**
 * Scroll current chat conversation up
 * @param I - The I object of the interactive command
 */
function cefm_scroll_current_conversation_up(I){
  cefm_scroll_current_conversation(I, 0 - cefm_scroll_gap);
}

/**
 * Scroll current chat conversation down
 * @param I - The I object of the interactive command
 */
function cefm_scroll_current_conversation_down(I){
  cefm_scroll_current_conversation(I, cefm_scroll_gap);
}

/**
 * Find the selected story
 * @param document - The document object of the current buffer (I.buffer.document)
 * @return Returns the selected story div object if found, otherwise, returns null
 */
cefm.findSelectedStory = function (document){
  var selectedStory = null;
  var selectedStorySelectors = cefm.selectors.selectedStory;
  selectedStorySelectors.forEach(function(selector){
    var story = document.querySelector(selector);
    if(story !== null) selectedStory = story;
  });
  
  return selectedStory;
};

/**
 * Inspect and find the link of selected story
 * @param I - The I object of the interactive command
 * @param open_url_func - The function for opening the url
 */
function cefm_find_story_link(I, open_url_func){
  // get the document
  var document = I.buffer.document;
  var story_link_array = new Array();
  var selected_story = cefm.findSelectedStory(document);

  // check if the selected story exists

  if(selected_story != null){
  	// query all the possible potential links inside the selectedStory
  	var temp;
  	var tempArray;
  	temp = selected_story.querySelector("a._5pcq");
  	story_link_array.push(temp);
	  temp = selected_story.querySelector(".uiStreamSource>a");
	  story_link_array.push(temp);
    temp = selected_story.querySelector(".UFIBlingBox.uiBlingBox.feedbackBling");
    story_link_array.push(temp);
  	tempArray = selected_story.querySelectorAll(".fcg>a");
  	for(i=0; i<tempArray.length; i++){
  	  story_link_array.push(tempArray[i]);
  	}
  	tempArray = selected_story.querySelectorAll(".fwb");
  	for(i=0; i<tempArray.length; i++){
  	  var tempArray2 = tempArray[i].querySelectorAll("a");
  	  for(var j=0; j<tempArray2.length; j++){
  		  story_link_array.push(tempArray2[j]);
  	  }
  	}

  	// the regex array
  	var regex_array = new Array();
  	var regex;
  	// https://www.facebook.com/photo.php?fbid=681522898533972&set=a.451364638216467.109262.100000288032725&type=1
  	regex = new RegExp("^[A-Za-z0-9:/.]+(facebook.com/photo.php)[A-Za-z0-9?=.&/_]+$");
  	regex_array.push(regex);
  	// https://www.facebook.com/candycandy198/posts/273678246115411?stream_ref=1
  	regex = new RegExp("^[A-Za-z0-9:/.]+(facebook.com/)[A-Za-z0-9.]+(/posts/)[A-Za-z0-9:./?_=]+$");
  	regex_array.push(regex);
  	// https://www.facebook.com/groups/377906112324180/permalink/482710721843718/
  	regex = new RegExp("^[A-Za-z0-9:/.]+(facebook.com/groups/)[A-Za-z0-9.]+(/permalink/)[A-Za-z0-9./]+$");
  	regex_array.push(regex);
  	// https://www.facebook.com/media/set/?set=a.714473798592597.1073741843.100000899501161&type=1
  	regex = new RegExp("^[A-Za-z0-9:/.]+(facebook.com/media/set)/[A-Za-z0-9?.=/&]+$");
  	regex_array.push(regex);
  	// https://www.facebook.com/permalink.php?story_fbid=afjslkjks
  	regex = new RegExp("^[A-Za-z0-9:/.]+(facebook.com/permalink.php)[A-Za-z0-9_?=/&]+$");
  	regex_array.push(regex);
	  // https://www.facebook.com/emilyosment10392/activity/3489815221361
	  regex = new RegExp("^[A-Za-z0-9:/.]+(facebook.com/)[A-Za-z0-9.]+(/activity/)[A-Za-z0-9:./]+$");
	  regex_array.push(regex);
	  // https://www.facebook.com/TapChiChimLon/photos/a.173301119366880.49325/729867413710245/?type=1
	  regex = new RegExp("^[A-Za-z0-9:/.]+(facebook.com/)[A-Za-z0-9.]+(/photos)[A-Za-z0-9?=.&/_]+$");
	  regex_array.push(regex);
	  // https://www.facebook.com/groups/243388739045691/permalink/735257363192157/?stream_ref=1
	  regex = new RegExp("^[A-Za-z0-9:/.]+(facebook.com/groups/)[A-Za-z0-9.]+(/permalink/)[A-Za-z0-9?=.&/_]+$");
	  regex_array.push(regex);

  	// loop the story_link_array
  	var match = false;
  	for(i=0; i<story_link_array.length; i++){
  	  // check if the current link match the regex
  	  match = false;
  	  for(j=0; j<regex_array.length; j++){
  	  	if(regex_array[j].test(story_link_array[i])){
  	  	  match = true;
  	  	  break;
  	  	}
  	  }
  	  if(match){
  	  	open_url_func(story_link_array[i], I.window);
  	  	break;
  	  }
  	}
  	if(!match){
  	  I.minibuffer.message("Cannot find story link");
  	}
	  
  } else {
  	I.minibuffer.message("No selected story");
  }
}

/**
 * Expand the content of the selected story if exists, otherwise, expand the
 * first one found 
 * @param I - The I object of the interactive command
 */
function cefm_expand_story(I){
  var selectedStory = null;
  var document = I.buffer.document;
  var expandParent = null;
  var expandElement = null;

  // check if the selected story exists
  if((selectedStory = cefm.findSelectedStory(document)) != null){
	  expandParent = selectedStory;
  } else {
	  expandParent = document;
  }

  // find the expand element to click on
  if((expandElement = expandParent.querySelector(".text_exposed_link>a")) != null){
	  dom_node_click(expandElement);
  } else {
	  I.minibuffer.message("Cannot find any expand element");
  }
}

// check if the fbJewel panel (Friend Requests, Messages, Notifications,...) is
// currently closed or opened
// panelId: the id of the panel div tag (usually "fbMessagesFlyout",
// "fbNotificationsFlyout", "fbRequestsFlyout")
// I: the I object of the interactive command
function cefm_is_jewel_panel_open(panelId, I){
  var doc = I.buffer.document;

  var element = doc.querySelector("#" + panelId);
  if(element == null){
	  return false;
  } else {
	  if(element.classList.contains("toggleTargetClosed")){
	    return false;
	  } else {
	    return true;
	  }
  }
}

// browser object classes link for notification, friend requests and messages
define_browser_object_class("facebook-notification-links", null,
							              xpath_browser_object_handler("//a[@class='_33e']"),
							              $hint = "select notification");

define_browser_object_class("facebook-messages-links", null,
							              xpath_browser_object_handler("//a[@class='messagesContent']"),
							              $hint = "select notification");

////////////////////////////////////////////////////////////////////////////////
// Interactive Commands
interactive("cefm-open-friend-request",
			      "Open Facebook Friend Requests panel", function(I){
			        cefm.clickButton(I, "#fbRequestsJewel>a.jewelButton", "Friend Request");
			      });

interactive("cefm-open-messages",
			      "Open Facebook Messages panel", function(I){
			        cefm.clickButton(I, "._1z4y>.jewelButton", "Messages");
			      });

interactive("cefm-open-notification",
			      "Open Facebook Notification panel", function(I){
			        cefm.clickButton(I, "._4xi2>.jewelButton", "Notification");
			      });

interactive("cefm-open-home",
			      "Open Facebook Home page", function(I){
			        cefm.clickButton(I, "._2pdh>._1ayn", "Home");
			      });

interactive("cefm-open-profile",
			      "Open Facebook Profile page", function(I){
			        cefm.clickButton(I, "._4fn6>._1ayn", "Profile");
			      });

interactive("cefm-quick-logout",
			      "Quickly logout from Facebook", function(I){
			        cefm.clickButton(I, "#logout_form>label>input", "Logout");
			      });

interactive("cefm-open-current-story-new-buffer",
			      "Open selected story in new buffer", function (I) {
			        cefm_find_story_link(I, load_url_in_new_buffer);
			      });

interactive("cefm-open-current-story-new-buffer-background",
			      "Open selected story in new buffer background", function (I) {
			        cefm_find_story_link(I, load_url_in_new_buffer_background);
			      });

interactive("cefm-scroll-up-current-conversation",
			      "Scroll the current conversation up", function(I){
			        cefm_scroll_current_conversation_up(I);
			      });

interactive("cefm-scroll-down-current-conversation",
			      "Scroll the current conversation down", function(I){
			        cefm_scroll_current_conversation_down(I);
			      });

interactive("cefm-attach-image",
			      "Open selected story in new buffer", function (I) {
			        cefm_attach_image_to_conversation(I);
			      });

interactive("cefm-cycle-conversations",
			      "Cycle through chat conversations", function(I){
			        cefm_cycle_through_conversations(I);
			      });

interactive("cefm-expand-content",
			      "Expand the content of the selected story or the caption of the current photo", function(I){
			        cefm_expand_story(I);
			      });

interactive("cefm-follow-notifications", "Follow notification links", function(I){
  if(!cefm_is_jewel_panel_open("fbNotificationsFlyout", I))
	  cefm.clickButton(I, "#fbNotificationsJewel>a.jewelButton", "Notification");
  var element = yield read_browser_object(I);
  try {
    element = load_spec(element);
    if (I.forced_charset)
      element.forced_charset = I.forced_charset;
  } catch (e) {}
  browser_object_follow(I.buffer, FOLLOW_DEFAULT, element);
}, $browser_object = browser_object_facebook_notification_links);

interactive("cefm-follow-notifications-new-buffer", "Follow notification links in new buffer", function(I){
  if(!cefm_is_jewel_panel_open("fbNotificationsFlyout", I))
	  cefm.clickButton(I, "#fbNotificationsJewel>a.jewelButton", "Notification");
  var element = yield read_browser_object(I);
  try {
    element = load_spec(element);
    if (I.forced_charset)
      element.forced_charset = I.forced_charset;
  } catch (e) {}
  browser_object_follow(I.buffer, OPEN_NEW_BUFFER, element);
}, $browser_object = browser_object_facebook_notification_links);

interactive("cefm-follow-notifications-new-buffer-background",
			      "Follow notification links in new buffer background", function(I){
			        if(!cefm_is_jewel_panel_open("fbNotificationsFlyout", I))
				        cefm.clickButton(I, "#fbNotificationsJewel>a.jewelButton", "Notification");
			        var element = yield read_browser_object(I);
			        try {
				        element = load_spec(element);
				        if (I.forced_charset)
				          element.forced_charset = I.forced_charset;
			        } catch (e) {}
			        browser_object_follow(I.buffer, OPEN_NEW_BUFFER_BACKGROUND, element);
			      }, $browser_object = browser_object_facebook_notification_links);

interactive("cefm-follow-messages", "Follow messages conversation", function(I){
  if(!cefm_is_jewel_panel_open("fbMessagesFlyout", I))
	  cefm.clickButton(I, "#fbMessagesJewel>a.jewelButton", "Messages");
  var element = yield read_browser_object(I);
  try {
    element = load_spec(element);
    if (I.forced_charset)
      element.forced_charset = I.forced_charset;
  } catch (e) {}
  browser_object_follow(I.buffer, FOLLOW_DEFAULT, element);
}, $browser_object = browser_object_facebook_messages_links);

interactive("cefm-follow-multiple-notifications", "",
		        function(I){
			        var a = yield I.minibuffer.read($prompt = "Number of notifications to open: ");
			        if(isNaN(a)){
			          I.minibuffer.message("Please input a number!");
			        } else {
			          a = parseInt(a);
			          
			        }
		        });

provide("conkeror-extended-facebook-mode");
