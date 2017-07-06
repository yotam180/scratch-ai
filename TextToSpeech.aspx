<%@ Page Language="C#" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    
   <script>
       function getLanguages() {
           var temp = speechSynthesis.getVoices();
           langs = [];
           for (i = 0; i < temp.length; i++) {
               langs[langs.length] = temp[i]["lang"];
           }
           return langs
       }
       function say(text,lang,callback)
       {
           var msg = new SpeechSynthesisUtterance(text);
           if(lang)
               msg['lang'] = lang;
           window.speechSynthesis.speak(msg);
           if (callback)
               callback();
       }
       var languages = []
       say("hello");
   </script>
</body>
</html>
