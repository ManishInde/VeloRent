@echo off
SET MYSQL="C:\Program Files\MySQL\MySQL Server 9.5\bin\mysql.exe"
SET ARGS=-u root -pVeloRent@2026
SET DB=d:\DBMS\database

echo [1/7] Running 01_schema.sql...
%MYSQL% %ARGS% < %DB%\01_schema.sql
IF %ERRORLEVEL% NEQ 0 ( echo ERROR in 01_schema.sql & exit /b 1 )
echo Done.

echo [2/7] Running 02_indexes.sql...
%MYSQL% %ARGS% < %DB%\02_indexes.sql
IF %ERRORLEVEL% NEQ 0 ( echo ERROR in 02_indexes.sql & exit /b 1 )
echo Done.

echo [3/7] Running 03_views.sql...
%MYSQL% %ARGS% < %DB%\03_views.sql
IF %ERRORLEVEL% NEQ 0 ( echo ERROR in 03_views.sql & exit /b 1 )
echo Done.

echo [4/7] Running 04_procedures.sql...
%MYSQL% %ARGS% < %DB%\04_procedures.sql
IF %ERRORLEVEL% NEQ 0 ( echo ERROR in 04_procedures.sql & exit /b 1 )
echo Done.

echo [5/7] Running 05_functions.sql...
%MYSQL% %ARGS% < %DB%\05_functions.sql
IF %ERRORLEVEL% NEQ 0 ( echo ERROR in 05_functions.sql & exit /b 1 )
echo Done.

echo [6/7] Running 06_triggers.sql...
%MYSQL% %ARGS% < %DB%\06_triggers.sql
IF %ERRORLEVEL% NEQ 0 ( echo ERROR in 06_triggers.sql & exit /b 1 )
echo Done.

echo [7/7] Running 07_sample_data.sql...
%MYSQL% %ARGS% < %DB%\07_sample_data.sql
IF %ERRORLEVEL% NEQ 0 ( echo ERROR in 07_sample_data.sql & exit /b 1 )
echo Done.

echo.
echo ==========================================
echo  ALL FILES EXECUTED SUCCESSFULLY
echo ==========================================
