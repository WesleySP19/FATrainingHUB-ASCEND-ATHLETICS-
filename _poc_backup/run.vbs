' ==============================================================================
' Gatilho de Execução Simples (VBS)
' Este script abre automaticamente o arquivo index.html no navegador padrão.
' ==============================================================================

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Obtém o caminho do diretório onde este arquivo .vbs está localizado
strScriptPath = WScript.ScriptFullName
strFolder = objFSO.GetParentFolderName(strScriptPath)

' Monta o caminho completo para o index.html
strIndexPath = strFolder & "\index.html"

' Verifica se o arquivo existe antes de tentar abrir
If objFSO.FileExists(strIndexPath) Then
    ' Executa (abre) o arquivo usando o aplicativo padrão (o navegador)
    objShell.Run """" & strIndexPath & """"
Else
    MsgBox "O arquivo index.html não foi encontrado neste diretório.", 48, "Erro de Execução"
End If
