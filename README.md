**Steps to install portapara xrpl.**

# Items required
* Node
* Xumm App && XUMM developer console
* XRPL testnet accounts minimum of 2 (actuall any xrpl trasnactions are run on livenet in thes model, needs swapping)
* Uphold testnet account
* Yoti App
* SSL cert for HTTPS for Yoti and Uphold


# Step 1
set up mysql DB add user and password.

# Step 2
add Xumm API and secret key to .env file, add host and port whilst here.

# Step 3
add uphold api and secret key add SSL files (key.pem, csr.pem) to keys folder, add path to .env

# Step 4
add yoti api and secret key add SSL files (yoti.pem, yotidoc.pem) to keys folder, add path to .env

* there is also a keys1 folder with 3 files in but i cant remebr what there for, possible the https:// cert??

# Step 5
add an email address and use this same email address to set a test company account for uphold. and create a sand box account for the business at uphold

# Step 6
register a user and set this person to have a access level 2 this will get you all areas, as company admin. L/N 1348

# Step 7
add the XRPL company account and secret key to the comany DB

# Step 8
create a user
