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
// Story links
cefm.selectors.storyLink = [
  "a._5pcq", ".uiStreamSource>a", ".UFIBlingBox.uiBlingBox.feedbackBling",
  ".fcg>a", ".fwb a"
];
// Buttons
cefm.selectors.friendRequestButton = "#fbRequestsJewel>a.jewelButton";
cefm.selectors.messagesButton = "._1z4y>.jewelButton";
cefm.selectors.notificationButton = "._4xi2>.jewelButton";
cefm.selectors.homeButton = "._2pdh>._1ayn";
cefm.selectors.profileButton = "._4fn6>._1ayn";
cefm.selectors.logoutButton1 = "#userNavigationLabel";
cefm.selectors.logoutButton2 = "li._54ni:nth-child(17) > a:nth-child(1)"
// Messages
cefm.selectors.focusedConversation = '.fbNub._50mz._50-v.focusedTab';
// Chat conversation
cefm.selectors.openedConversation = '.fbNub._50mz._50-v.opened';
cefm.selectors.conversationTextarea = '._552m';
cefm.selectors.selectImageButton = "input._5f0v";
cefm.selectors.conversationBody = '.fbNubFlyoutBody.scrollable';

// Regex
cefm.regex = {};
// Story link format
cefm.regex.storyLink = [
  // https://www.facebook.com/photo.php?fbid=681522898533972&set=a.451364638216467.109262.100000288032725&type=1
  new RegExp("^[A-Za-z0-9:/.]+(facebook.com/photo.php)[A-Za-z0-9?=.&/_]+$"),
  // https://www.facebook.com/candycandy198/posts/273678246115411?stream_ref=1
  new RegExp("^[A-Za-z0-9:/.]+(facebook.com/)[A-Za-z0-9.]+(/posts/)[A-Za-z0-9:./?_=]+$"),
  // https://www.facebook.com/groups/377906112324180/permalink/482710721843718/
  new RegExp("^[A-Za-z0-9:/.]+(facebook.com/groups/)[A-Za-z0-9.]+(/permalink/)[A-Za-z0-9./]+$"),
  // https://www.facebook.com/media/set/?set=a.714473798592597.1073741843.100000899501161&type=1
  new RegExp("^[A-Za-z0-9:/.]+(facebook.com/media/set)/[A-Za-z0-9?.=/&]+$"),
  // https://www.facebook.com/permalink.php?story_fbid=afjslkjks
  new RegExp("^[A-Za-z0-9:/.]+(facebook.com/permalink.php)[A-Za-z0-9_?=/&]+$"),
  // https://www.facebook.com/emilyosment10392/activity/3489815221361
  new RegExp("^[A-Za-z0-9:/.]+(facebook.com/)[A-Za-z0-9.]+(/activity/)[A-Za-z0-9:./]+$"),
  // https://www.facebook.com/TapChiChimLon/photos/a.173301119366880.49325/729867413710245/?type=1
  new RegExp("^[A-Za-z0-9:/.]+(facebook.com/)[A-Za-z0-9.]+(/photos)[A-Za-z0-9?=.&/_]+$"),
  // https://www.facebook.com/groups/243388739045691/permalink/735257363192157/?stream_ref=1
  new RegExp("^[A-Za-z0-9:/.]+(facebook.com/groups/)[A-Za-z0-9.]+(/permalink/)[A-Za-z0-9?=.&/_]+$"),
  // https://www.facebook.com/video.php?v=711672295568033
  new RegExp("^[A-Za-z0-9:/.]+(facebook.com/video.php)[A-Za-z0-9?=.&/_]+$"),
  // https://www.facebook.com/TapChiChimLon/videos/992882410742076/
  new RegExp("^[A-Za-z0-9:/.]+(facebook.com/)[A-Za-z0-9?=.&/_]+(/videos/)[0-9/]+$"),
];

// Messages
cefm.messages = {};
cefm.messages.storyLinkNotFound = "Cannot find story link";
cefm.messages.noSelectedStory = "No selected story. Press j k to traverse story";
cefm.messages.expandElementNotFound = "Cannot find any expand element";
cefm.messages.noActiveConversation = 'No conversation opened. Press q to start chatting';
cefm.messages.noFocusedConversation = "No focused conversation. Focus on one conversation first";
cefm.messages.selectImageButtonNotFound = "Cannot find Select Image button";

// Button Names
cefm.buttonNames = {};
cefm.buttonNames.friendRequest = "Friend Request";
cefm.buttonNames.messages = "Messages";
cefm.buttonNames.notification = "Notification";
cefm.buttonNames.home = "Home";
cefm.buttonNames.profile = "Profile";
cefm.buttonNames.logout = "Logout";

// Scroll
cefm.scrollGap = 50; // scroll gap measured in pixel

////////////////////////////////////////////////////////////////////////////////
// Some functions needed for the mode
/**
 * Click on the button with the input css selector
 *
 * @param selector - The css selector of the button
 * @param buttonName - The name of the button, can be any name that you like
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
 *
 * @param I - The I object of the interactive command
 */
cefm.isFocusOnConversation = function (I){
  var document = I.buffer.document;
  var focusedConversation = document.querySelector(cefm.selectors.focusedConversation);
  if(focusedConversation !== null){
	  return true;
  } else {
	  return false;
  }
};

/**
 * Find the conversation div that is currently being focused
 *
 * @param I - The I object of the interactive command
 */
cefm.findFocusedConversation = function(I) {
  var document = I.buffer.document;
  var focusedConversation = document.querySelector(cefm.selectors.focusedConversation);
  return focusedConversation;
};

/**
 * Cycle through conversations
 * if there is no active conversation, tell the user to open, otherwise, find the
 * right one to focus
 * if not focus on any conversation, focus on the first one
 * otherwise, focus on the next one, if this is the last one, focus back on
 * the first one
 *
 * @param I - The I object of the interactive command
 */
cefm.cycleConversations = function(I) {
  var document = I.buffer.document;

  // get all the opened conversation divs
  var conversationDivs = document.querySelectorAll(cefm.selectors.openedConversation);

  // if no active conversation
  if(conversationDivs.length === 0) {
    I.minibuffer.message(cefm.messages.noActiveConversation);
  } else {
    // if not focus on any conversation
    if(!cefm.isFocusOnConversation(I)) {
      // focus the first one
      focusTextarea(conversationDivs[0]);
    } else {
      // if the focus is one the last one
      var focusedConversation = cefm.findFocusedConversation(I);
      if(focusedConversation === conversationDivs[conversationDivs.length - 1]) {
        // focus on the first one
        focusTextarea(conversationDivs[0]);
      } else {
        // focus one the next one
        // find the current index of the focused one
        var currentIndex;
        for(var i = 0; i < conversationDivs.length; i++) {
          if(focusedConversation === conversationDivs[i])
            currentIndex = i;
        }
        focusTextarea(conversationDivs[currentIndex + 1]);
      }
    }
  }

  function focusTextarea(conversationDiv) {
    var textarea = conversationDiv.querySelector(cefm.selectors.conversationTextarea);
    textarea.focus();
  }
};

/**
 * Attach Image to the current conversation
 *
 * @param I - The I object of the interactive command
 */
cefm.attachImageToConversation = function(I){
  var document = I.buffer.document;

  // find the focused conversation
  var focusedConversation = cefm.findFocusedConversation(I);

  if(focusedConversation === null) {
    I.minibuffer.message(cefm.messages.noFocusedConversation);
  } else {
    // find the select image button and click on it
    var selectImageButton = focusedConversation.querySelector(cefm.selectors.selectImageButton);
    if(selectImageButton === null) {
      I.minibuffer.message(cefm.messages.selectImageButtonNotFound);
    } else {
      dom_node_click(selectImageButton);
    }
  }
};

/**
 * Scroll current chat conversation
 *
 * @param I - The I object of the interactive command
 * @param scrollGap - The gap to scroll (positive for down, negative for scroll up)
 */
cefm.scrollCurrentConversation = function(I, scrollGap) {
  var document = I.buffer.document;

  // find the focused conversation
  var focusedConversation = cefm.findFocusedConversation(I);

  if(focusedConversation === null) {
    I.minibuffer.message(cefm.messages.noFocusedConversation);
  } else {
    // get the div that displays the chat content and scroll
    var chatBody = focusedConversation.querySelector(cefm.selectors.conversationBody);
    chatBody.scrollTop = chatBody.scrollTop + scrollGap;

    // thumbnail
    // cefm.showImageThumbInConversation(I, focusedConversation);
  }
};

/**
 * Scroll current chat conversation up
 *
 * @param I - The I object of the interactive command
 */
cefm.scrollCurrentConversationUp = function (I){
  cefm.scrollCurrentConversation(I, 0 - cefm.scrollGap);
};

/**
 * Scroll current chat conversation down
 *
 * @param I - The I object of the interactive command
 */
cefm.scrollCurrentConversationDown = function (I){
  cefm.scrollCurrentConversation(I, cefm.scrollGap);
};

/**
 * Find the selected story
 *
 * @param I - The I object of the interactive command
 * @return Returns the selected story div object if found, otherwise, returns null
 */
cefm.findSelectedStory = function (I){
  var document = I.buffer.document;
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
 *
 * @param I - The I object of the interactive command
 * @param openUrlFunction - The function for opening the url
 */
cefm.openSelectedStoryLink = function (I, openUrlFunction){
  // get the document
  var document = I.buffer.document;
  var storyLinks = [];
  var selectedStory = cefm.findSelectedStory(I);
  var regexes = cefm.regex.storyLink;

  // check if the selected story exists

  if(selectedStory !== null){
    // query all the possible potential story links
    cefm.selectors.storyLink.forEach(function(selector){
      var links = selectedStory.querySelectorAll(selector);
      for(var i = 0; i < links.length; i++) {
        storyLinks.push(links[0]);
      }
    });

  	// check if there is any story link matches the regex
  	var match = false;
  	for(var i = 0; i < storyLinks.length; i++){
  	  // check if the current link match the regex
  	  match = false;
  	  for(var j = 0; j < regexes.length; j++){
  	  	if(regexes[j].test(storyLinks[i])){
  	  	  match = true;
  	  	  break;
  	  	}
  	  }
  	  if(match){
  	  	openUrlFunction(storyLinks[i], I.window);
  	  	break;
  	  }
  	}

  	if(!match){
  	  I.minibuffer.message(cefm.messages.storyLinkNotFound);
  	}
  } else {
  	I.minibuffer.message(cefm.messages.noSelectedStory);
  }
};

/**
 * Expand the content of the selected story if exists, otherwise, expand the
 * first one found
 *
 * @param I - The I object of the interactive command
 */
cefm.expandStory = function (I){
  var selectedStory = null;
  var document = I.buffer.document;
  var expandParent = null;
  var expandElement = null;

  // check if the selected story exists
  if((selectedStory = cefm.findSelectedStory(I)) !== null){
	  expandParent = selectedStory;
  } else {
	  expandParent = document;
  }

  // find the expand element to click on
  if((expandElement = expandParent.querySelector(".text_exposed_link>a")) !== null){
	  dom_node_click(expandElement);
  } else {
	  I.minibuffer.message(cefm.messages.expandElementNotFound);
  }
};

/**
 * check if the fbJewel panel (Friend Requests, Messages, Notifications,...) is
 * currently closed or opened
 * panelSelector: the selector of the panel div tag
 * (usually "#fbMessagesFlyout", "#fbNotificationsFlyout", "#fbRequestsFlyout")
 *
 * @param I - The I object of the interactive command
 */
cefm.isJewelPanelOpen = function (I, panelSelector){
  var doc = I.buffer.document;

  var element = doc.querySelector(panelSelector);
  if(element === null){
	  return false;
  } else {
	  if(element.classList.contains("toggleTargetClosed")){
	    return false;
	  } else {
	    return true;
	  }
  }
};

cefm.displayImageFromMessage = function(I, message, focusedConversation) {
  var doc = I.buffer.document;
  var chatBody = focusedConversation.querySelector(cefm.selectors.conversationBody);

  // find the link that contains the image
  var link = message.querySelector('._ksh[role=img]');

  if(link !== null) {
    // src of the image
    var linkString = link.getAttribute('href');
    // make sure that it is the uploaded image
    if(linkString.indexOf('fbcdn-sphotos-h-a.akamaihd.net') >= 0) {
      // determine if this image is visible within the view port
      var posTop = chatBody.scrollTop - message.offsetTop;
      if(posTop < 150 && posTop > -150) {
        // create the div to show the image
        var div = doc.createElement('div');
        div.setAttribute('style', 'position: absolute; top: 100px; left: 100px; border: 1px; z-index: 100000');
        // img tag
        var img = doc.createElement('img');
        img.setAttribute('src', linkString);
        div.appendChild(img);

        // if there is another div exists, remove that
        if(!!I.buffer.tempImgDiv) {
          I.buffer.tempImgDiv.parentNode.removeChild(I.buffer.tempImgDiv);
          I.buffer.tempImgDiv = null;
        }

        // append the div to the page
        doc.querySelector('body').appendChild(div);
        I.buffer.tempImgDiv = div;

        // timer
        var event = {
	        notify: function(timer) {
            if(!!I.buffer.tempImgDiv) {
              I.buffer.tempImgDiv.parentNode.removeChild(I.buffer.tempImgDiv);
              I.buffer.tempImgDiv = null;
            }
	        }
        };

        if(!!I.buffer.lastTimer){
	        I.buffer.lastTimer.cancel();
        }

        // Now it is time to create the timer...
        I.buffer.lastTimer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);

        // ... and to initialize it, we want to call event.notify() ...
        // ... one time after exactly ten seconds.
        I.buffer.lastTimer.initWithCallback(event, 3000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);

        return true;
      }
      return false;
    }
    return false;
  }
  return false;
};

cefm.showImageThumbInConversation = function(I, focusedConversation){
  //
  var doc = I.buffer.document;
  var chatBody = focusedConversation.querySelector(cefm.selectors.conversationBody);

  // find all the chat messages
  var messages = focusedConversation.querySelectorAll('._5wd4');

  for(var i = 0; i < messages.length; i++) {
    if(cefm.displayImageFromMessage(I, messages[i], focusedConversation)) {
      break;
    }
  }

  function handle(message){
    // find the image
    var link = message.querySelector('._ksh[role=img]');

    if(link!= null) {
      var linkString = link.getAttribute('href');
      if(linkString.indexOf('fbcdn-sphotos-h-a.akamaihd.net') >= 0) {

        var posTop = chatBody.scrollTop - message.offsetTop;

        if(posTop < 150 && posTop > -150) {
          dump('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n');
          dump(posTop);
          dump('\n');
          dump(message.offsetTop);
          dump('\n');
          dump(link);
          dump('\n');
          dump('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n');

          // create the div to show the image
          var div = doc.createElement('div');
          div.setAttribute('style', 'position: absolute; top: 100px; left: 100px; border: 1px; z-index: 100000');

          // img tag
          var img = doc.createElement('img');
          img.setAttribute('src', linkString);
          div.appendChild(img);

          if(!!I.buffer.tempDiv) {
            I.buffer.tempDiv.parentNode.removeChild(I.buffer.tempDiv);
            I.buffer.tempDiv = null;
          }

          doc.querySelector('body').appendChild(div);

          I.buffer.tempDiv = div;

          // timer
          var event = {
	          notify: function(timer) {
              if(!!I.buffer.tempDiv) {
                I.buffer.tempDiv.parentNode.removeChild(I.buffer.tempDiv);
                I.buffer.tempDiv = null;
              }
	          }
          };

          if(!!cefm.lastTimer){
	          cefm.lastTimer.cancel();
          }

          // Now it is time to create the timer...
          cefm.lastTimer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);

          // ... and to initialize it, we want to call event.notify() ...
          // ... one time after exactly ten seconds.
          cefm.lastTimer.initWithCallback(event, 3000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
        }

      }
    }

  }
};

////////////////////////////////////////////////////////////////////////////////
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
			        cefm.clickButton(I, cefm.selectors.friendRequestButton, cefm.buttonNames.friendRequest);
			      });

interactive("cefm-open-messages",
			      "Open Facebook Messages panel", function(I){
			        cefm.clickButton(I, cefm.selectors.messagesButton, cefm.buttonNames.messages);
			      });

interactive("cefm-open-notification",
			      "Open Facebook Notification panel", function(I){
			        cefm.clickButton(I, cefm.selectors.notificationButton, cefm.buttonNames.notification);
			      });

interactive("cefm-open-home",
			      "Open Facebook Home page", function(I){
			        cefm.clickButton(I, cefm.selectors.homeButton, cefm.buttonNames.home);
			      });

interactive("cefm-open-profile",
			      "Open Facebook Profile page", function(I){
			        cefm.clickButton(I, cefm.selectors.profileButton, cefm.buttonNames.profile);
			      });

interactive("cefm-quick-logout",
			      "Quickly logout from Facebook", function(I){
                                 cefm.clickButton(I, cefm.selectors.logoutButton1, cefm.buttonNames.logout);
                                 cefm.clickButton(I, cefm.selectors.logoutButton2, cefm.buttonNames.logout);
			      });

interactive("cefm-open-current-story-new-buffer",
			      "Open selected story in new buffer", function (I) {
			        cefm.openSelectedStoryLink(I, load_url_in_new_buffer);
			      });

interactive("cefm-open-current-story-new-buffer-background",
			      "Open selected story in new buffer background", function (I) {
			        cefm.openSelectedStoryLink(I, load_url_in_new_buffer_background);
			      });

interactive("cefm-scroll-up-current-conversation",
			      "Scroll the current conversation up", function(I){
			        cefm.scrollCurrentConversationUp(I);
			      });

interactive("cefm-scroll-down-current-conversation",
			      "Scroll the current conversation down", function(I){
			        cefm.scrollCurrentConversationDown(I);
			      });

interactive("cefm-attach-image",
			      "Open selected story in new buffer", function (I) {
			        cefm.attachImageToConversation(I);
			      });

interactive("cefm-cycle-conversations",
			      "Cycle through chat conversations", function(I){
			        cefm.cycleConversations(I);
			      });

interactive("cefm-expand-content",
			      "Expand the content of the selected story or the caption of the current photo", function(I){
			        cefm.expandStory(I);
			      });

interactive("cefm-follow-notifications", "Follow notification links", function(I){
  if(!cefm.isJewelPanelOpen(I, "#fbNotificationsFlyout"))
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
  if(!cefm.isJewelPanelOpen(I, "#fbNotificationsFlyout"))
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
			        if(!cefm.isJewelPanelOpen(I, "#fbNotificationsFlyout"))
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
  if(!cefm.isJewelPanelOpen(I, "#fbMessagesFlyout"))
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
			          a = parseInt();

			        }
		        });

provide("conkeror-extended-facebook-mode");
