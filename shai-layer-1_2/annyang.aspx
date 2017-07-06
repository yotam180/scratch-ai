<%@ Page Language="C#" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head >
    <title></title>
</head>
<body>
  <script runat="server">
      string st = "";
      public void Page_Load()
      {
        //  st = Request.Form["file"];
          object a = Request.Form["abc"];
      }
  </script>
    <script>
        function say(text, lang, callback) {
            var msg = new SpeechSynthesisUtterance(text);
            if (lang)
                msg['lang'] = lang;
            window.speechSynthesis.speak(msg);
            if (callback)
                callback();
        }
    </script>
    <script src="annyang.min.js"></script>
    <script type="text/javascript">
        var text;
        var lastSaid;
        var calls = [];
        var had_said = {};
        if (annyang) {
            var commands = {
                     
            };
            annyang.addCommands(commands);
            annyang.start();
        }
        else {
            alert("annyang not connected");
        }
        function Listen(callback)
        {
            var command = {
                '*tag': function (tag) {
                    console.log(tag);
                    if (calls.length > 0) {
                        lastSaid = tag;
                        for (i = 0; i < calls.length; i++) {
                            calls[i]();
                            calls.splice(i, 1);
                        }
                        annyang.removeCommands('*tag');
                    }
                }
            };
            annyang.addCommands(command);
            if(calls.lastIndexOf(callback)==-1)
            {
                calls[calls.length] = callback;
            }
        }
        function get_last_said() {
            return lastSaid;
        }
        function said(pattern)
        {
            if(had_said[pattern]==undefined)
            {
                had_said[pattern] = false;
                var command = { pattern: function (tag) { had_said[pattern] = true; alert("12"); lastSaid = pattern.replace('*tag', tag); } };
                annyang.addCommands(command);
                annyang
                return had_said[pattern];
            }
            else
            {
                var temp = had_said[pattern];
                if(had_said[pattern])
                {
                    had_said[pattern] = undefined;
                }
                return temp;
            }
           
        }
        Listen(function () { say(lastSaid); });
        //said("*tag");
        
    </script>
</body>
   
</html>
