// include the default facebook mode
require("facebook");

// facebook shortcut keys
define_key(facebook_keymap, "j", null, $fallthrough);
define_key(facebook_keymap, "k", null, $fallthrough);
define_key(facebook_keymap, "return", null, $fallthrough);
define_key(facebook_keymap, "q", null, $fallthrough);
define_key(facebook_keymap, "/", null, $fallthrough);
define_key(facebook_keymap, "l", null, $fallthrough);
define_key(facebook_keymap, "m", null, $fallthrough);
define_key(facebook_keymap, "c", null, $fallthrough);

// function for inspecting and finding the link of selected story
function facebook_mode_find_story_link(I, open_url_func){
  var doc = I.buffer.document;
  var selectedStory = doc.querySelector(".selectedStorySimple");
  if(selectedStory == null){
	I.minibuffer.message("No selected story");
  } else {
	var timestamp = selectedStory.querySelector(".timestamp");
	if(timestamp == null){
	  I.minibuffer.message("Cannot find timestamp link");
	} else {
	  var link = timestamp.parentNode;
	  open_url_func(link, i.window);
	}
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
