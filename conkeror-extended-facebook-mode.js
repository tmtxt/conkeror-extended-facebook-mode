/* conkeror-extended-facebook-mode
   Conkeror Extended Facebook Mode

Copyright (C) 2013 Trần Xuân Trường <me@truongtx.me>

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.

*/

////////////////////////////////////////////////////////////////////////////////O
// 
// function for extend the story content (see more...)

////////////////////////////////////////////////////////////////////////////////
// Include library
require("facebook"); // the default Conkeror's Facebook mode

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

////////////////////////////////////////////////////////////////////////////////
// Variables used
var cefm_conversation_not_found_message
= "Cannot find conversation div";
var cefm_no_active_conversation_message
= "No active conversations. Press q to find a friend to chat.";
var cefm_no_focused_conversation_message
= "No focused conversation. Focus on one conversation first";
var facebook_mode_scroll_gap = 50;

////////////////////////////////////////////////////////////////////////////////
// Some functions needed for the mode
/**
 * Click on the button with the input css selector
 * @param selector - The css selector of the button
 * @param button_name - The name of the button, can be any name that you like
 * @param I - The I object of the interactive command
*/
function cefm_click_button(selector, button_name, I){
  var document = I.buffer.document;
  var button = document.querySelector(selector);
  if (button != null) {
	dom_node_click(button);
  } else {
	I.minibuffer.message("Cannot find " + button_name + " button");
  }
}

/**
 * Check if the focus is on any conversations or not
 * @param document - The document object of the current buffer (I.buffer.document)
 */
function cefm_is_focus_on_conversation(document){
  var activeElement = document.activeElement;
  if(activeElement.classList.contains("_552m")){
	return true;
  } else {
	return false;
  }
}

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
  var conversationDiv = document.querySelectorAll("._50-v.fbNub._50mz._50m_");
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
	if(cefm_is_focus_on_conversation(document)){
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
	if(cefm_is_focus_on_conversation(document)){
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
  cefm_scroll_current_conversation(I, 0 - facebook_mode_scroll_gap);
}

/**
 * Scroll current chat conversation down
 * @param I - The I object of the interactive command
 */
function cefm_scroll_current_conversation_down(I){
  cefm_scroll_current_conversation(I, facebook_mode_scroll_gap);
}

/**
 * Find the selected story
 * @param document - The document object of the current buffer (I.buffer.document)
 * @return Returns the selected story object if found, otherwise, returns null
 */
function cefm_find_selected_story(document){
  var selectedStory = null;
  if((selectedStory = document.querySelector(".selectedStorySimple")) != null
	|| (selectedStory = document.querySelector("._5gxh")) != null
	|| (selectedStory = document.querySelector("._5qdv")) != null){
  }
  return selectedStory;
}
   
/**
 * Inspect and find the link of selected story
 * @param I - The I object of the interactive command
 * @param open_url_func - The function for opening the url
 */
function cefm_find_story_link(I, open_url_func){
  // get the document
  var document = I.buffer.document;
  var story_link_array = new Array();
  var selected_story = cefm_find_selected_story(document);

  // check if the selected story exists

  if(selected_story != null){
  	// query all the possible potential links inside the selectedStory
  	var temp;
  	var tempArray;
  	temp = selected_story.querySelector("a._5pcq");
  	story_link_array.push(temp);
	temp = selected_story.querySelector("._5pc1>a");
	story_link_array.push(temp);
	temp = selected_story.querySelector("a._5pc0");
	story_link_array.push(temp);
	temp = selected_story.querySelector(".uiStreamSource>a");
	story_link_array.push(temp);
  	tempArray = selected_story.querySelectorAll(".fcg>a");
  	for(i=0; i<tempArray.length; i++){
  	  story_link_array.push(tempArray[i]);
  	}
  	tempArray = selected_story.querySelectorAll(".fwb");
  	for(i=0; i<tempArray.length; i++){
  	  var tempArray2 = tempArray[i].querySelectorAll("a");
  	  for(j=0; j<tempArray2.length; j++){
  		story_link_array.push(tempArray2[j]);
  	  }
  	}

  	// the regex array
  	var regex_array = new Array();
  	var regex;
  	// https://www.facebook.com/photo.php?fbid=681522898533972&set=a.451364638216467.109262.100000288032725&type=1
  	regex = new RegExp("^[A-Za-z0-9:/.]+(facebook.com/photo.php)[A-Za-z0-9?=.&/]+$");
  	regex_array.push(regex);
  	// https://www.facebook.com/cellphones.befirst.always/posts/698666850151154
  	regex = new RegExp("^[A-Za-z0-9:/.]+(facebook.com/)[A-Za-z0-9.]+(/posts/)[A-Za-z0-9:./]+$");
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
  if((selectedStory = cefm_find_selected_story(document)) != null){
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

////////////////////////////////////////////////////////////////////////////////
// Interactive Commands
interactive("cefm-open-friend-request",
			"Open Facebook Friend Requests panel", function(I){
			  cefm_click_button("#fbRequestsJewel>a.jewelButton", "Friend Request", I);
			});
interactive("cefm-open-messages",
			"Open Facebook Messages panel", function(I){
			  cefm_click_button("#fbMessagesJewel>a.jewelButton", "Messages", I);
			});
interactive("cefm-open-notification",
			"Open Facebook Notification panel", function(I){
			  cefm_click_button("#fbNotificationsJewel>a.jewelButton", "Notification", I);
			});
interactive("cefm-open-home",
			"Open Facebook Home page", function(I){
			  cefm_click_button("#navHome>a", "Home", I);
			});
interactive("cefm-quick-logout",
			"Quickly logout from Facebook", function(I){
			  cefm_click_button("#logout_form>label>input", "Logout", I);
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
interactive("cefm-cycle-conversations",
			"Cycle through chat conversations", function(I){
			  cefm_cycle_through_conversations(I);
			});
interactive("cefm-expand-content",
		   "Expand the content of the selected story or the caption of the current photo", function(I){
			 cefm_expand_story(I);
		   });

provide("conkeror-extended-facebook-mode");
