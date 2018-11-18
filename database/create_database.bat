mongoimport --db TROC --collection members --file members.json --jsonArray --drop
mongoimport --db TROC --collection properties --file properties.json --jsonArray --drop
mongoimport --db TROC --collection services --file services.json --jsonArray --drop

@echo off
REM =====================================
REM         	COLLECTIONS
REM =====================================
REM _____________________________________
REM 			MEMBERS
REM _____________________________________

REM email
REM password
REM name
REM firstName
REM role
REM city
REM address
REM phone
REM notation			(- optionnal - table of comment, member and date)

REM _____________________________________
REM     		PROPERTIES
REM _____________________________________

REM name
REM description
REM picture
REM price
REM keywords
REM owner
REM disponibility   	(table of start_date and end_date)
REM use   			(table of start_date, end_date and user)

REM _____________________________________
REM     		SERVICES
REM _____________________________________

REM name
REM description
REM keywords
REM owner
REM disponibility   	(table of start_date and end_date)
REM use   			(table of start_date, end_date and user)