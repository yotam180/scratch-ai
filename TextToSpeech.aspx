<%@ Page Language="C#" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <script src="responsivevoice.js">
    </script>
   <script>
       function say(text,lang,callback)
       {
           var msg = new SpeechSynthesisUtterance(text);
           if(lang)
               msg['lang'] = lang;
           window.speechSynthesis.speak(msg);
           if (callback)
               callback();
       }
       say("hello");
   </script>
</body>
</html>
