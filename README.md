# Gabbyxd

### TEST EDIT 

PRE REQUISITES(MERON DAPAT ):

PHP 8.0.30 (php -v)
Composer version 2.8.6(composer -v) 
Node Version v22.16.0 (node -v)
Npm version 10.9.2 (npm -v)
XAMPP control panel


###SETUP STEP BY STEP (REFER to: https://laravel.com/docs/12.x/installation)

First:
Install PHP and Composer

To Test you could type in cmd
```
php -v 
composer -v
```

if it works it means you got it


Second(NO NEED TO DO PROJECT IS ALREADY EXISTING):
Since the project is from scratch I have to setup the whole laravel project
by typing "composer global require laravel/installer" in my terminal
![alt text]({A4F31D25-6940-4B72-A91F-2E5054DAC0DC}.png)

then "laravel new example-app" where in this case I name it Carenderia-Management-System
![alt text]({BF8773B5-2F96-4AFB-9840-8514132696E1}.png)

Let it setup and it should say 

```  INFO  Application key set successfully.

   INFO  Application ready! Build something amazing.
```

Third: 

We go INSIDE the folder(carenderia chuchu) and run this three commands in the terminal
```
cd example-app(name of the folder)
npm install && npm run build(seperate)
php artisan serve(Backend)
npm run dev(Frontend)
```

congrats you just setup your first laravel app!

c:\Users\therm\AppData\Local\Packages\MicrosoftWindows.Client.Core_cw5n1h2txyewy\TempState\ScreenClip\{03FD2845-6B68-492A-A2E3-729A5714E61A}.png


Fourth:

Assuming that all is working and ready

OPEN XAMPP -> Open Apache and MYSQL -> go to localhost/phpmyadmin/ or click the admin on mysql sa xampp

Create a db named carenderia_db (NO CAPS)
c:\Users\therm\AppData\Local\Packages\MicrosoftWindows.Client.Core_cw5n1h2txyewy\TempState\ScreenClip\{2CB38F35-C908-4924-88C5-A33706ED136E}.png

### Bugs/Problems you might encounter while operating Xampp:

OCCUPIED PORT when trying to start MYSQL in XAMPP:

![alt text]({E5E38B54-1410-4862-9B57-CE4B5E356B51}.png)
![alt text]({8E2BAACE-CF30-4B9F-A174-554D5377B299}.png)


Go to Task manager -> Search mysql -> End task -> Start mysql in xamppe


fifth:

TO test that it works properly
type in the cmd "php artisan migrate" (MAKE SURE NA NASA LOOB KA NG FOLDER ELSE MAGKAKAERROR) *carender-management-system*

we could check it out sa db if it works (Open carenderia_db on php admin) it should have the basic tables such as the users and suchs

c:\Users\therm\AppData\Local\Packages\MicrosoftWindows.Client.Core_cw5n1h2txyewy\TempState\ScreenClip\{8C8E32EA-7D2C-4A53-8FFE-BE9732FFCC8B}.png


## Start HERE

Now that's all setup assuming that this was cloned in another device 
in terminal of your vsc (git clone https://github.com/gabsuu0404/Gabbyxd.git)

check prequisites above if you have it all
then step by step:

- composer install
- npm install
- copy .env.example .env
```ganto dapat laman nung nasa taas nung env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=carenderia_db
DB_USERNAME=root
DB_PASSWORD=
```
-php artisan key
-php artisan migrate (put all table in database)

-npm run dev(frontend)
-php artisan serve(backend)

-TADAH WORKING
