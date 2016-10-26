# Documentación en español

Utilidad para automatizar varias tareas que vamos a tener que hacer todos nosotros para migrar a bitbucket y subir artefactos a artifactory. 

## (1) Instalación:

    npm install -g cells-migration-tool

## (2) Doctor (diagnostica tu sistema)

En cualquier directorio ejecuta:

    migra-cells doctor

   - Comprobará si tienes correctamente configurado ssh para conectarse a bitbucket si no es así te guiará como hacerlo.
   - Comprobará si .bowerrc y .npmrc están presentes y correctamente configurados en la home de tu usuario.

## (3) Migrar repositorios de un servidor a otro recursivamente.

En el raíz de donde tengas todos los repositorios git ejecuta:

    migra-cells migrate
    
   - Puedes mezclar repositorios que ya existan en bitbucket con los que no existan la herramienta es suficientemente lista como para comprobarlo y solo cambiar los que existan. *puedes ejecutarlo en projects/components sin problemas*
   - Recorrerá todos los directorios recursivamente detectando repositorios git y cambiando el origin a bitbucket.
   - Comprobará que el repositorio existe en bitbucket: Si no existe preguntará para generarlo manualmente y copiar el contenido en el nuevo repositorio.
 
```
  Manually create repository ${repoName},
    (Y) Assume that creation was done (n) Do not migrate this repository
```

   - Si encuentra repositorios de otros repositorios no cambiará nada. 
   - Además como primer paso hará el doctor

## (4) Cambiar el proyecto

Si el proyecto en el repo de origen es distinto al de destino seguir esta guia:

   - 1) Crear un fichero matches.json con la correspondencia entre los dos proyectos. así

```
{
    "matches" : {
        "cm" : "bgcm"
    }
}
```

   - 2) Cuando se ejecute cualquier comando de migra-cells añadir el fichero como parámetro
    
    migra-cells migrate ---paramsFile matches.json
    
Cambiará la url de : 

"https://descinet.yourcompany.es/stash/cm/cells-sass.git#~1.0.0",
a 
"ssh://git@devtools.yourcompany.com:7999/bgcm/cells-sass.git#~1.0.0",


## (5) Cambio de "origin" recursivo de todos tus repositorios git.

En el raíz de donde tengas todos los repositorios git ejecuta:

    migra-cells changeOrigin

   - Puedes mezclar repositorios que ya existan en bitbucket con los que no existan la herramienta es suficientemente lista como para comprobarlo y solo cambiar los que existan. *puedes ejecutarlo en projects/components sin problemas*
   - Recorrerá todos los directorios recursivamente detectando repositorios git y cambiando el origin a bitbucket. 
   - Comprobará que el repositorio existe en bitbucket y si no es así no cambiará nada.
   - Si encuentra repositorios de otros repositorios no cambiará nada.
   - Además como primer paso hará el doctor

## (6) Cambio de dependencias al nuevo dominio

En el raíz de donde tengas todos los repositorios git con proyectos bower o npm ejecuta:

    migra-cells changeDeps

   - Cambiará las dependencias de: 

"cells-sass": "https://descinet.yourcompany.es/stash/scm/cel/cells-sass.git#~1.0.0",
a 
"cells-sass": "ssh://git@devtools.yourcompany.com:7999/cel/cells-sass.git#~1.0.0",

## (7) Cambio de dependencias y subida a Artifactory

En el raíz de donde tengas todos los repositorios git con proyectos bower o npm ejecuta:

    migra-cells publishAll

    - Cambiará las dependencias de: 

"cells-sass": "https://descinet.yourcompany.es/stash/scm/cel/cells-sass.git#~1.0.0",
a 
"cells-sass": "~1.0.0",

   - Solo publicará los repositorios que estén en bitbucket y se hayan cambiado las dependencias con éxito.
   - La herramienta comprueba la publicación primero en dev.devtools.yourcompany.com y si todo es correcto: " ejecutando un bower install o un npm install" publica todos los repositorios (bower y npm) en devtools.yourcompany.com y sube todos los cambios a bitbucket haciendo un push de los ficheros bower.json y package.json que ha cambiado.
   - En el commit el comentario por defecto será: 

    _(automatic) change dependencies to registry mode_

Si quieres cambiarlo puedes hacerlo mediante el parámetro commitMessage, así:

    migra-cells publishAll --commitMessage "pongo aquí lo que crea conveniente poner"

   - Si algo falla la herramienta deja los directorios tal y como se los encontró hace rollback de todo, por lo tanto es completamente inocua. Si quieres ver cual ha sido el problema con más detalle ejecuta el comando con la opción -ov:
    migra-cells publishAll -ov

*(IMPORTANTE: si no tienes permisos para subir artefactos a artifactory (es decir, la mayoría de vosotros), este comando fallará, ahórrate mirar con -ov puesto que te encontrarás en algún lado un error 401 lanzado por globaldevops.grupoyourcompany.com)*

   - Si quieres cambiar las dependencias a ^ o ~

por ejemplo de 
"pisco-cells-contexts": "git+https://descinet.yourcompany.es/stash/scm/ctool/pisco-cells-contexts#1.1.0",
a 
"pisco-cells-contexts": "^1.1.0",

ejecutar:

    *migra-cells publishAll --rangeAppend  \^*
       o
    *migra-cells publishAll --rangeAppend  \~*
    
    - Si solo quieres hacer la subida de artefactos a artifactory*

En el raíz de donde tengas todos los repositorios git con proyectos bower o npm ejecuta:

    migra-cells all::publishAll

##(8) Subir un directorio o fichero a multiples repositorios (haciendo commit y push)

En el raíz de donde tengas todos los repositorios git ejecuta:

    migra-cells environment:pushFileAll --pushFile ${pathtofileordir} --comment "chore(): add this file or dir to all"

donde pathtofileordir es la ruta al fichero o directorio que quieres subir a todos los repositorios.

# Main Index:

- User Commands
- [All Commands Availables](#all-commands-availables)
    - from **cells-migration-friend  v.0.1.2**
        - [all:changeOrigin (Change origin recursively)](#appchangeorigin-change-origin-recursively)
        - [all:doctor (Checks the SSH and registry configurations)](#appdoctor-checks-the-ssh-and-registry-configurations)
        - [all:publishAll (Publish recursively all repos)](#apppublishall-publish-recursively-all-repos)
        - [all::changeOrigin (Change git origin to all projects recursively)](#allchangeorigin-change-git-origin-to-all-projects-recursively)
        - [all::checkRegistry (Check if registry configuration is correct)](#allcheckregistry-check-if-registry-configuration-is-correct)
        - [all::checkSSH (Check if SSH is configurated correctly)](#allcheckssh-check-if-ssh-is-configurated-correctly)
        - [all::d2rAll (Change recursively dependencies to registry mode)](#alld2rall-change-recursively-dependencies-to-registry-mode)
        - [all::publishAll (Check, publish and push all repositories)](#allpublishall-check,-publish-and-push-all-repositories)
- [Plugins](#plugins)
    - from **cells-migration-friend  v.0.1.2**
        - [bowerRegistry](#bowerRegistry)
        - [dependencies](#dependencies)
        - [keyCache](#keyCache)
        - [npmRegistry](#npmRegistry)
- [Contexts](#contexts)
- [Recipes](#recipes)



# All Commands Availables



### all::changeOrigin 'Change git origin to all projects recursively'
[Go Index](#main-index):

How to execute this command:

    pisco all::changeOrigin

General info:

```
Contexts:  all
From: cells-migration-friend (0.1.2)
```


### all::checkRegistry 'Check if registry configuration is correct'
[Go Index](#main-index):

How to execute this command:

    pisco all::checkRegistry

General info:

```
Contexts:  all
From: cells-migration-friend (0.1.2)
```


### all::checkSSH 'Check if SSH is configurated correctly'
[Go Index](#main-index):

How to execute this command:

    pisco all::checkSSH

General info:

```
Contexts:  all
From: cells-migration-friend (0.1.2)
```


### all::d2rAll 'Change recursively dependencies to registry mode'
[Go Index](#main-index):

How to execute this command:

    pisco all::d2rAll

General info:

```
Contexts:  all
From: cells-migration-friend (0.1.2)
```


### all::publishAll 'Check, publish and push all repositories'
[Go Index](#main-index):

How to execute this command:

    pisco all::publishAll

General info:

```
Contexts:  all
From: cells-migration-friend (0.1.2)
```

###node-module:convert (Convert any module into a piscosour recipe)
[Go Index](#main-index):

How to execute this command:

    pisco node-module:convert




#### 1. node-module:convert 'Convert any nodejs module into a piscosour recipe'
General info:

```
Contexts:  node-module
From: piscosour (1.0.0-alpha.28)
```
shot convert

###recipe:add-flow (Add a flow to a piscosour recipe)
[Go Index](#main-index):

How to execute this command:

    pisco recipe:add-flow




#### 1. recipe:add-flows 'Adding step to a flow'
General info:

```
Contexts:  recipe
From: piscosour (1.0.0-alpha.28)
```
shot straws

###recipe:add-step (Add a step to a piscosour recipe)
[Go Index](#main-index):

How to execute this command:

    pisco recipe:add-step




#### 1. recipe:add-steps 'Create new pisco step inside this module'
General info:

```
Contexts:  recipe
From: piscosour (1.0.0-alpha.28)
```
shot shots

###recipe:docs (Append documentation from info.md to readme.md of the recipe)
[Go Index](#main-index):

How to execute this command:

    pisco recipe:docs




#### 1. recipe:generate-docs 'Generate one file per flow inside a directory'
General info:

```
Contexts:  recipe
From: piscosour (1.0.0-alpha.28)
```
shot generate-docs


### all::npm 'DEPRECATED'
[Go Index](#main-index):

How to execute this command:

    pisco all::npm

General info:

```
Contexts:  all
From: piscosour (1.0.0-alpha.28)
```
#### Deprecated! Use requirements instead!

### node-module::convert 'Convert any nodejs module into a piscosour recipe'
[Go Index](#main-index):

How to execute this command:

    pisco node-module::convert

General info:

```
Contexts:  node-module
From: piscosour (1.0.0-alpha.28)
```
shot convert


### recipe::add-flows 'Adding step to a flow'
[Go Index](#main-index):

How to execute this command:

    pisco recipe::add-flows

General info:

```
Contexts:  recipe
From: piscosour (1.0.0-alpha.28)
```
shot straws


### recipe::add-steps 'Create new pisco step inside this module'
[Go Index](#main-index):

How to execute this command:

    pisco recipe::add-steps

General info:

```
Contexts:  recipe
From: piscosour (1.0.0-alpha.28)
```
shot shots


### recipe::configure 'Configure piscosour.json'
[Go Index](#main-index):

How to execute this command:

    pisco recipe::configure

General info:

```
Contexts:  recipe
From: piscosour (1.0.0-alpha.28)
```
shot piscosour


### recipe::generate-docs 'Generate one file per flow inside a directory'
[Go Index](#main-index):

How to execute this command:

    pisco recipe::generate-docs

General info:

```
Contexts:  recipe
From: piscosour (1.0.0-alpha.28)
```
shot generate-docs


### recipe::scaffolding 'Create a piscosour recipe from a scaffold template'
[Go Index](#main-index):

How to execute this command:

    pisco recipe::scaffolding

General info:

```
Contexts:  recipe
From: piscosour (1.0.0-alpha.28)
```
shot scaffolding


### recipe::update 'Update tool'
[Go Index](#main-index):

How to execute this command:

    pisco recipe::update

General info:

```
Contexts:  recipe
From: piscosour (1.0.0-alpha.28)
```
### Update version of recipe

This shot execute npm install -g **recipeName**. recipeName has to be in params._pkgName

###component:polylint (Cells components polylinter)
[Go Index](#main-index):

How to execute this command:

    pisco component:polylint




# Plugins


## context
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)

### Context for the pisco execution

With this plugin you can automatically check where recipe was executed. This plugin take configuration from params and expose two method and make one pre-hook check.
 
#### How two configure repoType definitions

You can configure the repoTypes definition in all the configurations files where pisco recipes are configured [see information for pisco configuration](doc/Load_Parameters.md). 

**Is recommend to use the piscosour.json file of your recipe**

The param is called contexts, and must be a Hash with the name of the repoType as key and Array with all the rules the repo must to match.

example of piscosour.json:
```
    "params": {
        "contexts": {
            "node-module": [
                {
                    "file": "package.json",
                    "conditions": [
                        "that.version"
                    ]
                },
                {
                    "file": "piscosour.json",
                    "noexists": "true"
                }
            ],
            "recipe": [
                {
                    "sufficient": true,
                    "file": ".piscosour/piscosour.json",
                    "conditions": [
                        "that.repoType==='recipe'"
                    ]
                },
                {
                    "file": "package.json",
                    "conditions": [
                        "that.keywords.indexOf('piscosour-recipe')>=0"
                    ]
                },
                {
                    "file": "piscosour.json"
                }
            ]
        }
    },
```

**Rules:**

Define all rules that a repoType must match. All rules not sufficient must to be satisfied.

- **file:** The path of the file relative to the root of the repoType. (for exemple: package.json for a node-module)
- **sufficient:** If this rule is matched the rest of the rules are ignored. If is not matched, the rule is ignored and the rest of rules are evaluated (default: false)
- **noexist:** Check if the file is **not** present. (default: false)
- **conditions:** Is an array with all the conditions that the file must to match. 
  1. The file must to be a correct json file.
  2. **that** is the instance of the json object.
  3. write one condition per element in your array. 
  4. The conditions were evaluated using javascript.

#### Pre-hook: Check one shot is executed in the root of any repository type.

By default, the shot behaviour is assume that repoType is mandatory, if you need to execute one shot without this check of context, use **contextFree** parameter. **contextFree** usually is used for shotd like "create" or something like that.  

only parametrized in params.json:

```
{
 [...]
  "contextFree" : true
}
```

A user command (straw) only could be contextFree if all of its shots are contextFree. If only one shot of a straw is not contextFree then the context will be checked.

**Disable this check using options in the command line**: Is possible to disable this check using this option in the command line: **--b-disableContextCheck**. Usefull for system requirements checks.

#### addon: this.ctxIs

| Param | Description |
| --- | --- |
| name | name of the repoType to test|


Use this.ctxIs to ask pisco where was executed.

```
let isComponent = this.ctxIs("component");
```

isComponent must to be true if your recipe was executed in the root of a component.

#### addon: this.ctxWhoami

Ask pisco the repoTypes of the directory where you executed your recipe.

```
let repos = this.ctxWhoami();
```

repos is an Array of types that match the place where your recipe was executed.
## fsutils
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)

### fs plugin (fs addons for piscosour)

#### this.fsCreateDir

| Param | Description |
| --- | --- |
| | |

#### this.fsExists

| Param | Description |
| --- | --- |
| | |

#### this.fsReadConfig

| Param | Description |
| --- | --- |
| | |

#### this.fsReadFile

| Param | Description |
| --- | --- |
| | |

#### this.fsCopyDirFiltered

| Param | Description |
| --- | --- |
| | |

#### this.fsCopyFileFiltered

| Param | Description |
| --- | --- |
| | |

#### this.fsAppendBundle

| Param | Description |
| --- | --- |
| | |

## inquirer
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)

### Inquirer plugin

This plugin use inquirer library [Inquirer documentation](https://www.npmjs.com/package/inquirer)

set type 

params.json
```
  "prompts": [
    {
      "type": "#setType()",
      "name": "doDefault",
      "required": true,
      "message": "Do you want to set default repository type?"
    }
  ],
```

- '#' indicate that is necesary to use a function in the shot in order to resolve the type value.
- '()' set that pisco needs to execute this function on order to get the value. 

shot.js
```
  setType: function() {
    return 'confirm';
  },
```

#### this.inquire

| Param | Description |
| --- | --- |
| | |
## installer
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)

### Install recipes needed

This plugins install all recipes needed for the execution. 

#### Hooks:

- **'core-install'**: Perform npm installation of the compatible version of the recipe
- **config**: Execute 'pisco -w' in order to write the scullion configuration.
- **run**: Execute the installed step. 
## launcher
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)

### Execute any command with pisco.

Core plugin used to execute any command inside pisco.

#### this.sh

| Param | Description |
| --- | --- |
| command | command that you want to execute|
| reject | reject function, called if command fails (stop overall execcution)|
| loud | Boolean if true echo of command is done|

Syncronous method use to execute any command in your environment.

#### this.sudo

| Param | Description |
| --- | --- |
| | |

#### this.executeSync

| Param | Description |
| --- | --- |
| | |

#### this.executeStreamed

| Param | Description |
| --- | --- |
| | |

#### this.execute

| Param | Description |
| --- | --- |
| | |

#### this.executeParallel

| Param | Description |
| --- | --- |
| | |
## os
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)


Plugins used to check Operating System where pisco is running

###Addons:

#### this.isWin();

return true if the Operation System where pisco is executed is Windows.

#### this.isMac();

return true if the Operation System where pisco is executed is MacOS.
## piscosour
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)

### Expose piscosour config

Expose core configuration to shots.

#### this.piscoConfig

Expose the piscosour config object [Trabajar con shots](doc/api.md#Config)
  
#### this.piscoFile

return the literal: 'piscosour.json'

#### this.pkgFile

return the literal: 'package.json'


## skipper
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)

### Skipper plugin

Skips the shot execution when receiving the param "\_skip": true

## stream-write-hook
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)

### Intercepts any stream flow in order to be able to manage the information inside.

This way you can capture all the output of any stream and do whatever you want with it. The way to do this has two stages:

#### 1. Start intercepting the stream

At any place in yor code is posible to intercept any stream the only thing you have to do is use streamWriteHook method:

```
   let capture = '';
   this.streamWriteHook(process.stdout, function(chunk, encoding, cb) {
     capture += stripcolorcodes(chunk.toString(encoding));
   });
```

(*) stripcolorcodes() is used to deleting all coloured characters from stream. 
  
Capture will contain all from content of process.stdout

#### 2. Stop intercepting the stream.

Is necesary to do release all system resources, so do this:

```
   this.streamWriteUnhook(process.stdout);
```

### Addons:

#### this.streamWriteHook

starts the hook

| Param | Description |
| --- | --- |
|stream |Stream to be hooked |
|cb |Function to call each time chunk is append to stream |

#### this.streamWriteUnhook

stops the hook

| Param | Description |
| --- | --- |
|stream |Stream to be Unhooked |



## system-checker
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)

### How to check system requirements of a piscosour command.

The system requirements are other commands that pisco needs for a pipeline execution. This plugin checks if everything is installed and ready to use by piscosour.

#### 1. Define version match (Only in the cases where could be diferent)

By default version is taken asking the command with -v and assume that command return version plain without test.

    bower -v 
    > 1.7.9

But in some cases this is not true, in this cases you can define matches inside **piscosour.json**:  

Example of piscosour.json
```
{
  [...]  
  "params": {
    [...]
    "versions": {
      "java": {
        "option" : "-version",
        "regexp" : "\"(.*?)_"
      },
      [...]
    },
  [...]
}
```

By default this is the versions defined inside core:

```
    "versions": {
      "bower" : {
        "npm": true,
        "list": "bower cache list",
        "cmdInstaller": "bower install"        
      },
      "npm" : {
        "list": "npm list -g --depth 0",
        "regexp": "\\@(.*?)\\s"
        "cmdInstaller": "npm install -g"
      },    
      "java": {
        "option" : "-version",
        "regexp" : "\"(.*?)_"
      },
      "sass" : {
        "regexp" : "s (.*?) "
      },
      "git": {
        "option" : "--version",
        "regexp" : "n (.*?)\\n"
      }
    }
```

- **key** (for example 'java'): is the command that you need inside your shot.
- **option**: (optional, default is '-v') if version is set the way to check this version.
- **regexp**: (optional) if version is on a string the way to extract only the version. Overwrite version defined on piscosour.json
- **list:** (optional) command used to get a stdout to use the regexp function in orther to get the version of the item you want to check.
- **cmdInstaller:** (optional) command used to install packages using this key (for example 'npm install -g' or 'bower install')

##### List tip

Useful when you want to check if some dependency is listed by any command. 
 
 1. Set list in version (f.i. in npm)
 2. In any other requirement set listedIn: (f.i. module: set listedIn: npm)

this pugling is going to check the version returned when the match with regexp is done.

#### 2. Define system requirements in all your shots.

The system requirements are defined in **params.json** file inside every shot.

-**requirements** All dependencies are defined inside requirements

Example of params.json:
```
{
  "requirements": {
    "polymer" : {
      "installer": "bower",
      "listedIn": "bower",
      "uri": "https://github.com/Polymer/polymer.git#v1.6.1",
      "regexp": "=(.*?)"
    },
    "generator-pisco-recipe" : {
      "installer": "npm",
      "listedIn": "npm",
      "version" : "0.0.2"
    },
    "pisco" : {
      "installer": "npm",
      "pkg" : "piscosour",
      "version" : "0.5.0"
    },
    "cordova" : {
      "installer": "npm",
      "version" : "5.4.1"
    },
    "yo" : {"npm": true},
    "bower" : {
      "installer": "npm",
      "version" : "1.7.9"
    },
    "java": {
      "version": "1.7.0"
    },
    "sass" : {
      "version": "3.1.0"
    }
  },
  [...]
}
```

This is the possible parameters that you need in order to define a system requirement.

- **key** (for example 'java'): is the command that you need inside your shot.
- **installer** (optional): package command, search inside requirements to check the cmdInstaller.
- **version**: (optional) is the minimum version that you need for the command. Overwrite version defined on piscosour.json
- **option**: (optional, default is '-v') if version is set the way to check this version.
- **regexp**: (optional) if version is on a string the way to extract only the version. Overwrite version defined on piscosour.json
- **listedIn**: (optional) use the 'list' value of this parameter in order to check if this dependency is available.
- **uri**: (optional) only apply in npm commands. Uri of the git repo.
- **pkg**: (optional) only apply in npm commands. Used when executable and pkg are different.
 
#### 3. Check if a pisco command has all system requirements satisfied

    cells component:validate --pstage core-check --b-disablePrompts --b-disableContextCheck
    
Command explanation:

- **cells component:validate**: is the pisco command that you want to check.
- **--pstage core-check**: this means that only the core-check stage is executed for all the pipeline. System requirements check is a **pre-hook** of the stage **core-check** so you have to execute only this stage.
- **--b-disablePrompts**: disable all prompts for the command.
- **--b-disableContextCheck**: disable context checks for commands that need one.

this is the result of the execution for every shot that would have system requirements defined:

```
[12:14:32] java ( 1.7.0 ) is required ->  java ( 1.8.0_65 ) impossible to parse ... WARNING!
[12:14:33] cordova ( 5.4.1 ) is required ->  cordova ( 5.4.1 ) is installed ... OK
[12:14:34] yo ( any version ) is required ->  yo is installed ... OK
[12:14:35] bower ( 1.0.0 ) is required ->  bower ( 1.7.7 ) is installed ... OK
[12:14:35] sass ( 3.1.0 ) is required ->  sass ( 3.4.19 ) is installed ... OK
```

If any system requirement is not satisfied the command will throw an error and stops...
## system-saver
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)

### Write the requirements into a global file 'requirements.json'

    cells component:validate --pstage check --b-saveRequirements --b-disablePrompts --b-disableContextCheck --b-disableSystemCheck
    
Command explanation:

- **cells component:validate**: is the pisco command that you want to check.
- **--pstage check**: this means that only the check stage is executed for all the pipeline. System requirements check is a **pre-hook** of the stage **check** so you have to execute only this stage.
- **--b-saveRequirements**: tells pisco to save all system requirements in one file.
- **--b-disablePrompts**: disable all prompts for the command. 
- **--b-disableContextCheck**: disable context checks for commands that need one.
- **--b-disableSystemCheck**: disable system checks in order to avoid vicious cycle.

this is the file resulting of the execution: the mix of all system requirements for all shots.

```
{
  "npm": {
    "module": "generator-pisco-recipe",
    "version": "0.0.2"
  },
  "java": {
    "version": "1.7.0",
    "option": "-version",
    "regexp": "\"(.*?)_"
  },
  "cordova": {
    "version": "5.4.1"
  },
  "yo": {},
  "bower": {
    "version": "1.0.0"
  },
  "sass": {
    "version": "3.1.0",
    "regexp": "s (.*?) "
  }
}
```
## test
from: **piscosour (1.0.0-alpha.28)**  [Go Index](#main-index)

Testing plugin. NO FUNCTIONALITY.
## bowerRegistry
from: **cells-migration-friend (0.1.2)**  [Go Index](#main-index)


## dependencies
from: **cells-migration-friend (0.1.2)**  [Go Index](#main-index)


## keyCache
from: **cells-migration-friend (0.1.2)**  [Go Index](#main-index)


## npmRegistry
from: **cells-migration-friend (0.1.2)**  [Go Index](#main-index)


# Contexts


[Go Index](#main-index):

|Name|Description|
|---|---|
|node-module|node-module context|
|recipe|Piscosour recipe context|
|app|Cells app context|
|component|Cells component context|
|cordova-app|Cells cordova app context|
|cordova-plugin|Cordova plugin|
|environment|Cells environment context|



# Recipes


[Go Index](#main-index):

|Name|Version|Description|
|---|---|---|
|piscosour|1.0.0-alpha.28|Get all your devops tools wrapped-up!|
|cells-cli|0.7.0-alpha.7|cli tools for your cells components|
|pisco-cells-contexts|1.2.0|Pisco context definitions for Cells project|
|cells-migration-friend|0.1.2|migration asistant tool|


