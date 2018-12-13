mongoimport --db TROC --collection members --file members.json --jsonArray --drop
mongoimport --db TROC --collection properties --file properties.json --jsonArray --drop
mongoimport --db TROC --collection services --file services.json --jsonArray --drop

# =====================================
# 			COLLECTIONS
# =====================================
# _____________________________________
#			MEMBERS
# _____________________________________
#
# email
# password
# name
# firstName
# role
# city
# address
# phone
# notation			(- optionnal - table of comment, member and date)
# 
# _____________________________________
#			PROPERTIES
# _____________________________________
#
# name
# description
# picture
# price
# keywords
# owner
# disponibility   	(table of date)
# use   			(table of user and disponibility)
#
# _____________________________________
#			SERVICES
# _____________________________________
#
# name
# description
# keywords
# owner
# disponibility   	(table of date)
# use   			(table of user and disponibility)