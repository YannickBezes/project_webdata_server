#! /usr/bin/env python
# coding: utf-8
import getopt
import logging
import sys
import os
import re
import json
import random
import codecs
import unicodedata
from StringIO import StringIO
from objdict import ObjDict
from termcolor import colored

BOLD_TEXT = "\033[1m"
RESET_TEXT = "\033[0;0m"
# Logger
logging.basicConfig(
    format="LOGGER {} - %(message)s".format(
        colored(BOLD_TEXT + "%(levelname)s", "red")
    ),
    level=logging.INFO
)
logger = logging.getLogger()

# How to use the script
def how_to_use_it():
    print colored("Generate a dataset", "magenta")
    print colored("-h       --help                  Display all arguments of this script", "green")
    print colored("-m      --number-members         number of members", "blue")
    print colored("-p      --number-properties      number of properties", "red")
    print colored("-s      --number-services        number of services", "yellow")

# Main part of the script
def main(argv):
    # Default values
    num_members = 11
    num_properties = 11
    num_services = 11

    try:
        # Get the arguments
        opts, _ = getopt.getopt(
            argv, "hm:p:s:", ["help", "members=", "properties=", "services="]
        )
    except getopt.GetoptError as e:
        print "The are some error : {}\n\n".format(e)
        how_to_use_it()
        sys.exit(1)

    # Get the value of each arguments
    for opt, arg in opts:
        if opt in ('-h', "--help"):
            how_to_use_it()
            sys.exit()
        elif opt in ("-m", "--number-members"):
            num_members = int(arg)
        elif opt in ("-p", "--number-properties"):
            num_properties = int(arg)
        elif opt in ("-s", "--number-services"):
            num_services = int(arg)

    # Create members
    members = create_members(num_members)
    with open("../members.json", 'w') as file:
        file.write(json.dumps(members, ensure_ascii=False).encode('utf-8'))
    
    # Create properties
    properties = create_properties(num_properties, members)
    with open("../properties.json", "w") as file:
        file.write(json.dumps(properties, ensure_ascii=False).encode('utf-8'))
    
    # Create services
    services = create_services(num_services, members)
    with open("../services.json", "w") as file:
        file.write(json.dumps(services, ensure_ascii=False).encode('utf-8'))


def create_members(num_members):
    """ 
    Create a list of member from 0 to `num_members`
    :param num_members length of members
    :return list of members
    """
    # Get all first names
    firstnames = []
    with open("./data/firstname.txt", "r") as file:
        firstnames = file.read().split(";")

    # Get all last names
    lastnames = []
    with open("./data/lastname.txt", "r") as file:
        lastnames = file.read().split(";")

    # Get all french cities
    cities = []
    with open("./data/cities.txt", "r") as file:
        cities = [c for c in file.read().split(";")]

    # Get all address
    addresses = []
    with open("./data/address.txt", "r") as file:
        addresses = file.read().split(";")
    members = []
    for _ in range(0, num_members):
        member = {}
        member['lastname'] = lastnames[random.randrange(len(lastnames))]
        member['firstname'] = firstnames[random.randrange(len(firstnames))]
        member['role'] = "user"
        member['city'] = cities[random.randrange(len(cities))]
        member['address'] = addresses[random.randrange(len(addresses))]
        member['email'] = "{}.{}@duoflex.com".format(member['firstname'].lower(), member['lastname'].lower())

        # Check if the member doesn't exist yet
        while member_exist(members, member):
            member['lastname'] = lastnames[random.randrange(len(lastnames))]
            member['firstname'] = firstnames[random.randrange(len(firstnames))]
            member['email'] = "{}.{}@duoflex.com".format(member['firstname'].lower(), member['lastname'].lower())
        
        # Change it when we find the algo for the password
        member['password'] = "password"
        members.append(member)
    return members

def create_properties(num_properties, members):
    """ 
    Create a list of properties from 0 to `num_properties`
    :param num_properties length of properties
    :return list of properties
    """
    partial_properties = []
    with open("./data/partial_properties.json", "r") as file:
        partial_properties = json.loads(file.read())
    
    properties = []
    for _ in range(0, num_properties):
        random_property = partial_properties[random.randrange(len(partial_properties))]
        random_member = members[random.randrange(len(members))].copy()
        _property = {}
        _property['name'] = random_property['name']
        _property['description'] = random_property['description']
        _property['url_image'] = ""
        _property['price'] = random_property['price']
        _property['keywords'] = random_property['keywords']
        # Delete object which we don't want them
        del random_member['role'], random_member['password']
        _property['owner'] = random_member

        # Set the disponibilities
        _property['disponibilities'] = []
        for _ in range(2, random.randrange(3, 20)):
            # Get month
            month = random.randrange(11, 13)
            # Get days
            day = random.randrange(1, 32)

            # Add disponibilities
            _property['disponibilities'].append(
                "{}/{}/2018 {}".format(str(month).zfill(2), str(day).zfill(2), "AM" if random.random() <= 0.5 else "PM")
            )
        _property['disponibilities'].sort()

        # Set the uses
        _property['uses'] = []
        # copy disponibilities to remove them later
        disponibilities = copy(_property['disponibilities'])        
        for _ in range(0, random.randrange(0, len(_property['disponibilities']))):
            # Get the disponibility
            random_disponibility = disponibilities[random.randrange(len(disponibilities))]
            disponibilities.remove(random_disponibility)

            # Get member
            random_user = members[random.randrange(len(members))].copy()
            del random_user['password'], random_user['role']

            # Add use
            _property['uses'].append({
                "user": random_user,
                "disponibility": random_disponibility
            })

        properties.append(_property)
        
    return properties

def create_services(num_services, members):
    """ 
    Create a list of services from 0 to `num_services`
    :param num_services length of services
    :return list of services
    """
    partial_services = []
    with open("./data/partial_services.json", "r") as file:
        partial_services = json.loads(file.read())
    
    services = []
    for _ in range(0, num_services):
        random_property = partial_services[random.randrange(len(partial_services))]
        random_member = members[random.randrange(len(members))].copy()
        _service = {}
        _service['name'] = random_property['name']
        _service['description'] = random_property['description']
        _service['keywords'] = random_property['keywords']
        # Delete object which we don't want them
        del random_member['role'], random_member['password']
        _service['owner'] = random_member

        # Set the disponibilities
        _service['disponibilities'] = []
        for _ in range(2, random.randrange(3, 20)):
            # Get month
            month = random.randrange(11, 13)
            
            # Get days
            day = random.randrange(1, 32)

            # Add disponibilities
            _service['disponibilities'].append(
                "{}/{}/2018 {}".format(str(month).zfill(2), str(day).zfill(2), "AM" if random.random() <= 0.5 else "PM")
            )
        _service['disponibilities'].sort()

        # Set the uses
        _service['uses'] = []
        # Copy disponibilities to remove them after
        disponibilities = copy(_service['disponibilities'])
        for _ in range(0, random.randrange(0, len(_service['disponibilities']))):
            # Get the disponibility
            random_disponibility = disponibilities[random.randrange(len(disponibilities))]
            disponibilities.remove(random_disponibility)

            # Get member
            random_user = members[random.randrange(len(members))].copy()
            del random_user['password'], random_user['role']

            # Add use
            _service['uses'].append({
                "user": random_user,
                "disponibility": random_disponibility
            })

        services.append(_service)
    return services

def member_exist(members, member):
    for m in members:
        if m['email'] == member['email']:
            return True
    return False

def copy(array):
    cp = []
    for v in array:
        cp.append(v)
    return cp

# Will cut the first argument which is the filename of the script
if __name__ == "__main__":
    main(sys.argv[1:])
