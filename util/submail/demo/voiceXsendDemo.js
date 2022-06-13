var VoiceXSend = require('../lib/voiceXsend');

var voice = new VoiceXSend();

voice.set_to('152********');
voice.set_project('vLTXZ');
voice.add_var('code', '88888888');

voice.xsend();
