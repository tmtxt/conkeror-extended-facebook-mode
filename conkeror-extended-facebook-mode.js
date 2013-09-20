/* conkeror-extended-facebook-mode
   Conkeror Extended Facebook Mode

   Version: 1.0.0
   
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

// :TODO
// cycle through conversations (selector _552m)

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
// define_key(facebook_keymap, "c", null, $fallthrough);

////////////////////////////////////////////////////////////////////////////////
// Functions for performing other keys that fallthrough cannot take effect
// open friend request panel
interactive("facebook-open-friend-request", "Open Facebook Friend Requests panel",
		   function(I){
			 var doc = I.buffer.document;
			 var requestButton = doc.
			   querySelector("#fbRequestsJewel>a.jewelButton");
			 dom_node_click(requestButton);
		   });
define_key(facebook_keymap, "3", "facebook-open-friend-request");

// open friend request panel
interactive("facebook-open-messages", "Open Facebook Messages panel",
		   function(I){
			 var doc = I.buffer.document;
			 var messageButton = doc.
			   querySelector("#fbMessagesJewel>a.jewelButton");
			 dom_node_click(messageButton);
		   });
define_key(facebook_keymap, "4", "facebook-open-messages");

// open notification panel
interactive("facebook-open-notification", "Open Facebook Notification panel",
		   function(I){
			 var doc = I.buffer.document;
			 var notificationButton = doc.
			   querySelector("#fbNotificationsJewel>a.jewelButton");
			 dom_node_click(notificationButton);
		   });
define_key(facebook_keymap, "5", "facebook-open-notification");

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
	|| (selectedStory = doc.querySelector("._5gxh")) != null){
	
	// get the timestamp tag inside the <a> tag
	var timestamp = selectedStory.querySelector(".timestamp");
	
	// check if it's null
	if(timestamp == null){
	  I.minibuffer.message("Cannot find timestamp link");
	} else {
	  // get the parent node <a> and open the url
	  var link = timestamp.parentNode;
	  open_url_func(link, i.window);
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
