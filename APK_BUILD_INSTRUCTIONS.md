# Gerar APK (Local e CI)

Este documento descreve como gerar um APK (debug ou release) a partir do projeto Ionic + Capacitor `caderno-ionic`.

## Opções

1) Build local (requer instalação do JDK e Android SDK)
2) Build automático via GitHub Actions (recomendada se você não quer instalar SDK localmente)

---

## 1) Build Local (Windows)

Pré-requisitos:
- Java JDK 17+ (Adicione `JAVA_HOME` nas variáveis do sistema e `%JAVA_HOME%\bin` no PATH).
- Android Studio + Android SDK (configure `ANDROID_SDK_ROOT` e adicione `platform-tools` ao PATH).

Passos:

1. Abra PowerShell:

```powershell
cd C:\Users\pique\Desktop\caderno
.\build-apk.ps1 -ProjectPath C:\Users\pique\Desktop\caderno-ionic -Release
```

2. O APK gerado será copiado para `C:\Users\pique\Desktop\caderno-ionic\builds`.

Observação: para gerar APK de debug, remova o `-Release`.

---

## 2) Build via GitHub Actions (automático)

O workflow está em `.github/workflows/android-build.yml`. Ele:
- Instala Node.js e Java 17
- Instala Android SDK
- Instala dependências npm e gera o build (www)
- Sincroniza o Capacitor
- Executa `gradlew assembleRelease`
- Faz upload do APK como artifact

Para usar:

1. Se necessário, mova o projeto `caderno-ionic` para conter o commit no mesmo repositório. O workflow assume que o diretório `caderno-ionic` está na raiz do repositório.

2. Faça commit e push no GitHub. O workflow rodará em `main` e gerará o APK. Você pode disparar manualmente no Actions -> Run workflow.

3. Baixe o artifact `app-release-apk` gerado pelo workflow.

### Build assinado (opcional)

Para publicar no Google Play, você precisa assinar o APK com sua `keystore`.  No GitHub Actions, recomenda-se usar secrets para armazenar o keystore codificado em base64:

- `ANDROID_KEYSTORE_BASE64` = conteúdo do keystore em base64
- `ANDROID_KEYSTORE_PASSWORD` = senha do keystore
- `ANDROID_KEY_ALIAS` = alias da chave
- `ANDROID_KEY_PASSWORD` = senha da chave (se diferente)

Exemplo de passos adicionais (no job `build`):

```yaml
- name: Decode keystore
  run: echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 --decode > release.keystore

- name: Sign APK
  run: |
    jarsigner -keystore release.keystore -storepass ${{ secrets.ANDROID_KEYSTORE_PASSWORD }} -keypass ${{ secrets.ANDROID_KEY_PASSWORD }} app-release.apk ${{ secrets.ANDROID_KEY_ALIAS }}

- name: Zipalign
  run: |
    zipalign -v -p 4 app-release.apk app-release-aligned.apk

- name: Upload signed APK
  uses: actions/upload-artifact@v4
  with:
    name: app-release-signed
    path: app-release-aligned.apk
```

---

## Observações finais
- Se você quiser que eu adicione o step de assinatura no Workflow e preparar tudo para gerar o APK assinado (caso você adicione os secrets no repo), eu posso preparar o YAML para você.
- Se preferir que eu gere o APK localmente, autorize a instalação de JDK + Android SDK (eu te guio) e eu posso gerar o APK na sua máquina.

Quer que eu adicione a etapa de assinatura ao workflow (para geração de APK assinado), ou prefere gerar debug APK localmente primeiro?  
Se preferir, posso também automatizar o upload do APK para um link (por exemplo via GitHub Releases) ao final do workflow.