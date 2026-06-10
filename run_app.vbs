Set WshShell = CreateObject("WScript.Shell")

' 1. Inicia o servidor Next.js em uma janela invisivel/minimizada (0) ou janela normal (1). 
' Colocando 1 para que o Coach veja os logs e saiba quando fechar.
WshShell.Run "cmd.exe /c start.bat", 1, false

' 2. Aguarda 8 segundos. O tempo foi aumentado porque agora o script verifica e atualiza o Banco de Dados (Prisma) antes de subir o React.
WScript.Sleep 8000

' 3. Abre o navegador direto na nova plataforma Full-Stack
WshShell.Run "http://localhost:3000"
