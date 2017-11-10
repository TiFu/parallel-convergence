@echo off
mkdir dist

MSBuild.exe client/plugins/plugins.sln /t:Build /p:Configuration="Release" /p:Platform="x86"

mkdir dist\src
mkdir dist\src\plugins

xcopy client\plugins\Release\*.dll dist\src\plugins\ /y

xcopy client\manifest.json dist\ /y
xcopy client\IconMouse*.png dist\ /y

pushd client\src
call npm install
call npm run precompile
popd

xcopy client\src\index.html dist\src\ /y

mkdir dist\src\public
xcopy client\src\public\* dist\src\public\ /e /y
