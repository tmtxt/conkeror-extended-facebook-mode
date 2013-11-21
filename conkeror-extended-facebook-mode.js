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

// TODO
// function for extend the story content (see more...)

// This mode is based on the Conkeror's built-in Facebook mode

// include the default facebook mode
require("facebook");

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

/**
 * Click on the button with the input css selector
 * @param the css selector of the button
 * @param the name of the button, can be any name that you like
 * @param the I object of the interactive command 
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

////////////////////////////////////////////////////////////////////////////////
// Functions for performing other keys that fallthrough cannot take effect
// open friend request panel
interactive("facebook-open-friend-request", "Open Facebook Friend Requests panel",
		   function(I){
			 cefm_click_button("#fbRequestsJewel>a.jewelButton", "Friend Request", I);
		   });

// open friend request panel
interactive("facebook-open-messages", "Open Facebook Messages panel",
		   function(I){
			 var doc = I.buffer.document;
			 var messageButton = doc.
			   querySelector("#fbMessagesJewel>a.jewelButton");
			 dom_node_click(messageButton);
		   });

// open notification panel
interactive("facebook-open-notification", "Open Facebook Notification panel",
		   function(I){
			 var doc = I.buffer.document;
			 var notificationButton = doc.
			   querySelector("#fbNotificationsJewel>a.jewelButton");
			 dom_node_click(notificationButton);
		   });

// open home page
interactive("facebook-open-home", "Open Facebook Home page",
		   function(I){
			 var doc = I.buffer.document;
			 var homeButton = doc.
			   querySelector("#navHome>a");
			 dom_node_click(homeButton);
		   });

// quick logout
interactive("cefm-quick-logout", "Quickly logout from Facebook",
		   function(I){
			 var doc = I.buffer.document;
			 var logoutButton = doc.querySelector("#logout_form>label>input");
			 dom_node_click(logoutButton);
		   });

////////////////////////////////////////////////////////////////////////////////
// Facebook chat interaction

// function for checking if the focus is on any conversations or not
function facebook_mode_is_focus_on_conversation(document){
  var activeElement = document.activeElement;
  if(activeElement.classList.contains("_552m")){
	return true;
  } else {
	return false;
  }
}

// function for finding the conversation div that is nth-level parent of the
// active element
// returns the conversation div object if it is found, otherwise, returns null
function facebook_mode_find_conversation_div(document){
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

// function for querying the conversationDiv and conversationTextareas array
function facebook_mode_find_conversation_div_array(document){
  var conversationDiv = document.querySelectorAll("._50-v.fbNub._50mz._50m_");

  if(conversationDiv.length == 0){
	return null;
  } else {
	return conversationDiv;
  }
}
function facebook_mode_find_conversation_textarea_array(document){
  return document.querySelectorAll("._552m");
}

// error strings
var facebook_mode_conversation_not_found
= "Cannot find conversation div";
var facebook_mode_no_active_conversation
= "No active conversations. Press q to find a friend to chat.";
var facebook_mode_no_focused_conversation
= "No focused conversation. Focus on one conversation first";

// Cycle through conversations
function facebook_mode_cycle_through_conversations(I){
  // get the document object
  var document = I.buffer.document;

  // query the div(s) that contain the chat conversations and the textareas for
  // typing chat message
  var conversationDiv;
  var conversationTextareas = facebook_mode_find_conversation_textarea_array(document);

  // check if there are any active conversations
  if((conversationDiv = facebook_mode_find_conversation_div_array(document)) != null){
	// check if the focus is on any conversation or not
	if(facebook_mode_is_focus_on_conversation(document)){
	  // find the conversation div that is nth-level parent of the active
	  // element
	  var p;
	  if((p = facebook_mode_find_conversation_div(document)) == null){
		I.minibuffer.message(facebook_mode_conversation_not_found);
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
	I.minibuffer.message(facebook_mode_no_active_conversation);
  }
}

// interactive commands for cycling through conversations
interactive("facebook-cycle-conversations", null, function(I){
  facebook_mode_cycle_through_conversations(I);
});

// scroll current chat conversation
var facebook_mode_scroll_gap = 50;

function facebook_mode_scroll_current_conversation(I, scroll_gap){
  // get the document buffer
  var document = I.buffer.document;

  // query the div(s) that contain the chat conversations and the textareas for
  // typing chat message
  var conversationDiv;
  var conversationTextareas = facebook_mode_find_conversation_textarea_array(document);

  // check if there are any active conversations
  if((conversationDiv = facebook_mode_find_conversation_div_array(document)) != null){
	// check if the focus is on any conversation or not
	if(facebook_mode_is_focus_on_conversation(document)){
	  // find the conversation div that is nth-level parent of the active
	  // element
	  var p;
	  if((p = facebook_mode_find_conversation_div(document)) == null){
		I.minibuffer.message(facebook_mode_conversation_not_found);
	  } else {
		// query the body of the chat (the scrollable part)
		var chat_body = p.querySelector(".fbNubFlyoutBody");
		// scroll to top
		chat_body.scrollTop = chat_body.scrollTop + scroll_gap;
	  }
	} else {
	  I.minibuffer.message(facebook_mode_no_focused_conversation);
	}
  } else {
	I.minibuffer.message(facebook_mode_no_active_conversation);
  }  
}

function facebook_mode_scroll_current_conversation_up(I){
  facebook_mode_scroll_current_conversation(I, 0 - facebook_mode_scroll_gap);
}

function facebook_mode_scroll_current_conversation_down(I){
  facebook_mode_scroll_current_conversation(I, facebook_mode_scroll_gap);
}

// interactive commands for scrolling up current conversation
interactive("facebook-scroll-up-current-coversation", null, function(I){
  facebook_mode_scroll_current_conversation_up(I);
});

// interactive commands for scrolling down current conversation
interactive("facebook-scroll-down-current-coversation", null, function(I){
  facebook_mode_scroll_current_conversation_down(I);
});

////////////////////////////////////////////////////////////////////////////////
// Open the selected story when browsing with j and k
// function for inspecting and finding the link of selected story
function facebook_mode_find_story_link(I, open_url_func){
  // get the document
  var doc = I.buffer.document;
  
  // query the selected story and check if it's exist
  // selected story is an element with class selectedStorySimple (old news feed)
  // or _5gxh (new style news feed)
  var selectedStory;
  if((selectedStory = doc.querySelector(".selectedStorySimple")) != null
	|| (selectedStory = doc.querySelector("._5gxh")) != null
	|| (selectedStory = doc.querySelector("._5qdv")) != null){

	// find the <a> tag that contains the story link
	var storyLink;
	if((storyLink = selectedStory.querySelector("a._5pcq")) != null
	  || ((storyLink = selectedStory.querySelector(".fcg>a")) != null && storyLink.getAttribute("href") != "#")){
	  open_url_func(storyLink, i.window);
	} else {
	  // for some special stories, the story link is hidden inside an <a> tag
	  // within a <span> with class fwb. there are 2 span inside selectedStory
	  // with class fwb, the one that contains the story link is the second one.
	  var fwbElements = selectedStory.querySelectorAll(".fwb>a");
	  if(fwbElements.length != 0){
		storyLink = fwbElements[1];
		open_url_func(storyLink, i.window);
	  } else {
		I.minibuffer.message("Cannot find timestamp link");
	  }
	}
  } else {
	I.minibuffer.message("No selected story");
  }

}

// interactive command to open selected story
// new buffer
interactive("facebook-open-current-story-new-buffer", null, function (I) {
  facebook_mode_find_story_link(I, load_url_in_new_buffer);
});
// new buffer background
interactive("facebook-open-current-story-new-buffer-background", null, function (I) {
  facebook_mode_find_story_link(I, load_url_in_new_buffer_background);
});

provide("conkeror-extended-facebook-mode");
