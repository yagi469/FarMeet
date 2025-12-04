@echo off
setlocal

set MAVEN_WRAPPER_JAR=.mvn\wrapper\maven-wrapper.jar
set MAVEN_WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar

if not exist "%MAVEN_WRAPPER_JAR%" (
    echo Downloading Maven Wrapper...
    if not exist ".mvn\wrapper" mkdir ".mvn\wrapper"
    powershell -Command "& {Invoke-WebRequest -Uri '%MAVEN_WRAPPER_URL%' -OutFile '%MAVEN_WRAPPER_JAR%'}"
    if %ERRORLEVEL% neq 0 (
        echo Failed to download Maven Wrapper.
        exit /b 1
    )
)

java "-Dmaven.multiModuleProjectDirectory=%CD%" -cp "%MAVEN_WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
