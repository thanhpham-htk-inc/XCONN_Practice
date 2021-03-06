(function(window, document, undefined) {
    if (!window.localStorage) {
      window.localStorage = {
        getItem: function (sKey) {
          if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
          return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
        },
        key: function (nKeyId) {
          return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
        },
        setItem: function (sKey, sValue) {
          if(!sKey) { return; }
          document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
          this.length = document.cookie.match(/\=/g).length;
        },
        length: 0,
        removeItem: function (sKey) {
          if (!sKey || !this.hasOwnProperty(sKey)) { return; }
          document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          this.length--;
        },
        hasOwnProperty: function (sKey) {
          return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        }
      };
      window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
    }
    var i,questions, currentQuestion;
    // pane elements
    var rightPane = document.getElementById('right-pane');
    var leftPane = document.getElementById('left-pane');
    // TODO: add other panes here


    // script elements that correspond to Handlebars templates
    var questionFormTemplate = document.getElementById('question-form-template');
    var questtionsTemplate = document.getElementById('questions-template');
    var expandedQuesttionTemplate = document.getElementById('expanded-question-template');
    // TODO: add other script elements corresponding to templates here

    // compiled Handlebars templates
    var templates = {
        renderQuestionForm: Handlebars.compile(questionFormTemplate.innerHTML),
        renderQuestions: Handlebars.compile(questtionsTemplate.innerHTML),
        renderExpandedQuestion: Handlebars.compile(expandedQuesttionTemplate.innerHTML)
        // TODO: add other Handlebars render functions here
    };

    /* Returns the questions stored in localStorage. */
    function getStoredQuestions() {
        if (!localStorage.questions) {
            // default to empty array
            localStorage.setItem('questions',JSON.stringify([]));
        }

        return JSON.parse(localStorage.getItem('questions'));
    }

    /* Store the given questions array in localStorage.
     *
     * Arguments:
     * questions -- the questions array to store in localStorage
     */
    function storeQuestions(questions) {
        localStorage.setItem('questions',JSON.stringify(questions));
    }

    questions=getStoredQuestions(); // list question
    //number of question
    if(!questions[questions.length-1])
        i=0;
    else i=questions[questions.length-1].id +1;             

    // TODO: tasks 1-5 and one extension

    // display question form initially
    showFormNewQuestion(rightPane);
    showListOfQuestion(questions,leftPane);

    
    //TODO: show form insert new question 
    function showFormNewQuestion(container)
    {
        container.innerHTML = templates.renderQuestionForm();
        document.getElementById("question-form").onsubmit= function( event)
        {
            var form= event.currentTarget;
            if(form.subject.value=="")
            {
                alert( " Please input subject");
            }
            else if(form.question.value=="")
            {
                alert("please input question");
            }
            else 
            {
                var subject=form.subject.value;
                var question = form.question.value;
                //reset form
                form.subject.value="";
                form.question.value="";

                var newQuestion={};
                var index=0
                // id of new question
                newQuestion.id=i;
                //subject of new question
                newQuestion.subject=subject;
                // detail of new question
                newQuestion.question=question;
                //push new question to questions
                questions.push(newQuestion);
               
                //render questions to panel
                showListOfQuestion(questions,leftPane);
                //store questions to cooki
                storeQuestions(questions);
                //increase number of question
                i++;
            }

            event.preventDefault();
        }
    }
    //TODO: show list of question
    function showListOfQuestion(listOfQuestions,container)
    {
        /*
        @param container : container contain list of questions
        */
        //show list of question in left bane
        container.innerHTML = templates.renderQuestions({'questions':listOfQuestions});
        // add event show question to right pane
        var listDiv = container.getElementsByTagName('div');
        for (var index=0; index<listDiv.length;index ++)
        {
            listDiv[index].addEventListener('click',function(event)
            {
                var question_ID=event.currentTarget.id; 
                //index of selected question
                var currentIndex = questions.map(function(val)
                {
                    return val.id==question_ID;
                }).indexOf(true);
                //set to current question
                currentQuestion = questions[currentIndex];    
                //show current question          
                showQuestion(currentQuestion,rightPane); 
                event.preventDefault();               
            });
        }
    }
    //TODO: show selected question
    function showQuestion(question,container)
    {/*
        @param question : selected question
        @param container: container contain question
        */
        if(!question)
        {
            event.preventDefault();
            return;
        }
        //show selected question on right pane
        container.innerHTML= templates.renderExpandedQuestion({'subject':question['subject'],'question': question['question'],'responses': question['responses']});
        //add event button response
        document.getElementById('response-form').addEventListener('submit', function(event)
        {
            var form= event.currentTarget;
            var name=form.name.value;
            var response= form.response.value;
            if(name == "")
            {
                alert( " Please input name");
            }
            else if(response == "")
            {
                alert("please input response");
            }
            else 
            {
                //reset form
                form.name.value = "";
                form.response.value = "";
                //add response to current question
                if(!currentQuestion['responses'])
                    currentQuestion['responses'] = [];
                currentQuestion['responses'].push({'name':name,'response':response})
                //show response
                showQuestion(currentQuestion,container);
                //store response to localStorage
                storeQuestions(questions);
            }
            event.preventDefault();
        });
        //add event button resolve
        document.getElementsByClassName('resolve btn')[0].addEventListener('click',function()
        {
            var question_ID=currentQuestion.id; //index of selected question
            var currentIndex = questions.map(function(val)
            {
                return val.id==question_ID;
            }).indexOf(true); 
            questions.splice(currentIndex,1);//remove current question
            // decrease number question
            currentQuestion="";
            //show new list of questions
            showListOfQuestion(questions,leftPane);
            //show form input new question
            showFormNewQuestion(rightPane);
            //restore list of questions
            storeQuestions(questions);
            //reset number of question
            if(!questions[questions.length-1])
                i=0;
            else i=questions[questions.length-1].id +1;
        });
    }
    //TODO: event click new question
    document.getElementsByClassName('btn')[0].addEventListener('click',function()
    {
        showFormNewQuestion(rightPane);
    });
    // TODO: search questions
    document.getElementById('search').onchange=function (event)
    {
        var searchText = event.currentTarget.value;
        if(!searchText)
        {
            showListOfQuestion(questions,leftPane);
        }
        else 
        {
            var replacetext='<span style="background-color: #fbe54e;">'+searchText+'</span>';
            var listSearchQuestion=[];
            var question;
            var re= new RegExp(searchText, 'g')
            for ( key in questions)
            {
                question=questions[key];

                if(question['subject'].indexOf(searchText)!=-1||question['question'].indexOf(searchText)!=-1)
                    //add to list of search questions
                    listSearchQuestion.push({'id':question['id'],
                        'subject':question['subject'].replace(re,replacetext),
                        'question':question['question'].replace(re,replacetext)})
            }
            showListOfQuestion(listSearchQuestion,leftPane);
        }
    };

})(this, this.document);
