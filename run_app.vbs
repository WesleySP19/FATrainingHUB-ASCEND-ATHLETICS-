Set WshShell = CreateObject("WScript.Shell")

' 0. Encerra processos antigos do Node.js para liberar a porta 3000
WshShell.Run "taskkill /F /IM node.exe", 0, true

' 1. Inicia o servidor Next.js em uma janela normal (1) para o Coach acompanhar.
WshShell.Run "cmd.exe /c start.bat", 1, false

' 2. Aguarda 12 segundos. O tempo foi aumentado porque agora o script deleta o cache e sincroniza o DB do zero, o que leva uns segundos a mais na primeira inicializacao.
WScript.Sleep 12000

' 3. Abre o navegador direto na dashboard da plataforma
WshShell.Run "http://localhost:3000"
