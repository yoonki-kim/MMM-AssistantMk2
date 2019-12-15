
# myMagicWord (beta)

AssistantMk2 v3 includes text-to-speech functionality.

This allows for natural responses during personalized actions.

# Installation

To use this feature, you must have an [IFTTT](https://www.ifttt.com) account.

IFTTT is free and allows communication with google assistant servers (gateway).

It allows you to create personalized actions.

Your IFTTT account should be linked to your google account.

## Custum action
We will [create](https://ifttt.com/create) a custom action for myMagicWord.
  

1. - Click on ***`If + This`***

 ![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/documents/myMagicWord/Step_1.jpg)

2. - Type ***`google assistant`*** on the search field, select it and validate.

 ![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/documents/myMagicWord/Step_2.jpg)

3. - Click on ***`Say a phrase with a text ingredient`***

 ![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/documents/myMagicWord/Step_3.jpg)
 
4. - Magic word creation
 In the field ***`What do you want to say`*** : define your magic word and finish by ***`space`*** and ***`$`***
 
 **Attention: Your magic word must not be used at the beginning of the sentence when you speak with the assistant.**
 
I advise you to use a word like: qwerty, jarvis.

it's just use as code for AssistantMk2.

 ![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/documents/myMagicWord/Step_4.jpg)
 
In the field ***`What do you want the Assistant to say in response`***.

You have  just to define a ***`$`*** and click on ***`Create trigger`*** for validate it

 5. - Click on ***`+ That`***
 
  ![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/documents/myMagicWord/Step_5.jpg)

 6. - type ***`webhooks`*** on the texte fiels and select ***`Webhooks`***
 
![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/documents/myMagicWord/Step_6.jpg)

 7. - Click on ***`Make a web request`***
 
  ![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/documents/myMagicWord/Step_7.jpg)

 8. - In the ***`URL`*** field : type a valid link at random for exemple ***`www.google.fr`***
 
  ![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/documents/myMagicWord/Step_8.jpg)
  
Valide it by clicking in ***`Create action`***

 9. - Uncheck ***`Receive notifications when this Applet runs`***
 
  ![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/documents/myMagicWord/Step_9.jpg) 
  
And click ***`Finish`***

 10. - Congratulations your MagicWord is now configured !
 
![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/documents/myMagicWord/Step_10.jpg)

##  Apply the changes on AssistantMk2

In the conguration file of MMM-AssistantMk2 (`config.js`)

Change the line : `myMagicWord: false,`

to for exemple: `myMagicWord: "jarvis",`

Of course, you need to change jarvis by your MagicWord defined

don't forget `"` and `,` at the last part

## Let's Test it !

1. - You can test you MagicWord with `MMM-TelegramBot` with the command `/s`

or with [test_ with_soundExec.js](https://github.com/eouia/MMM-AssistantMk2/blob/3-dev/recipes/test_%20with_soundExec.js "test_ with_soundExec.js") exemple recipe in recipe directory

to set it :  in the same way in config.js

replace : `recipes: [],` by `recipes: ["test_ with_soundExec.js"]`
 
2. - Restart your `MagicMirror`
3. - Activate the assistant and say `test`


![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/resources/AMk2_Small.png)

 *Bugsounet*
