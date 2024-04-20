import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import axios from 'axios';
import React, { useRef } from 'react';
import { useEffect } from 'react';
import Chart from 'chart.js/auto';
import  analy from './graphs';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { Link } from "react-router-dom";


import './App.css'
const LineChart = ({ labels, data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Example Dataset',
          data: data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    chartInstanceRef.current = chartInstance;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [labels, data]);

  return <canvas ref={chartRef} />;
};








function Home() {
  const [labelstime, setLabels] = useState([0]);
  const [datascore, setData] = useState([0]);
  
  
  const [count, setCount] = useState(0)
  const [videoFile, setVideoFile] = useState(null);
  const [playvideo, setPlayVideo] = useState(null);
  const [transcription, setTranscription] = useState('');



  const handleFileChange = (event) => {
    setVideoFile(event.target.files[0]);
    setPlayVideo(URL.createObjectURL(event.target.files[0]));
    console.log(URL.createObjectURL(event.target.files[0]));
    
 
    console.log(event.target.files[0]);
  };

  const transcribeVideo = async () => {
    try {
      const formData = {'video_path' : videoFile.name};
      

      const response = await axios.post('http://127.0.0.1:5000/transcribe_video', formData);

      setTranscription(response.data);
    } catch (error) {
      console.error('Error transcribing video:', error);
    }
  };

  const [quizData, setQuizData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/get_current_question');
        setQuizData(response.data[0]);
        console.log(response.data[0]);
        setCurrentQuestion(0);
        setSelectedOption('');
        setScore(0);
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
      }
    };

    // fetchQuiz();

    const interval = setInterval(() => {
      fetchQuiz();
    }, 60000); // Fetch quiz every 2 minutes

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (selectedOption === quizData[currentQuestion].answer) {
      setScore(score + 1);
      
      axios.get('http://127.0.0.1:5000/correct_answer')

      setLabels(prevLabels => [...prevLabels, (count + 1) ]);
      setData(prevData => [...prevData, 1]);
        } else {
          setLabels(prevLabels => [...prevLabels, (count + 1) ]);
         
          axios.get('http://127.0.0.1:5000/wrong_answer')
    
          setData(prevData => [...prevData, 0]);
        }
      
        setCount(count + 1);
        setSelectedOption('');
        setCurrentQuestion(currentQuestion + 1);
      };
  


  const [notes, setnotes] = useState(null);

  const getnotes = () => {
    axios.get('http://127.0.0.1:5000/summarize_text_with_bullets')
      .then(response => setnotes(response.data))
      .catch(error => console.error('Error:', error));
  };

  const [flowchart, setflowchart] = useState(null);
  
  const getflowchart = () => {
    axios.get('http://127.0.0.1:5000/generate_flowchart')
      .then(response => setflowchart(response.data))
      .catch(error => console.error('Error:', error));
  };

  const [advflowchart, setadvflowchart] = useState(null);
  
  const advgetflowchart = () => {
    axios.get('http://127.0.0.1:5000/generate_flowchart_advance')
      .then(response => setadvflowchart(response.data))
      .catch(error => console.error('Error:', error));
  };


  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
      fetchChatHistory();
  }, []);

  const fetchChatHistory = () => {
      axios.get('http://127.0.0.1:5000/history')
          .then(response => {
              setChatHistory(response.data);
          })
          .catch(error => {
              console.error('Error fetching chat history:', error);
          });
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      if (query.trim() === '') return;

      axios.post('http://127.0.0.1:5000/chat', { query: query })
          .then(response => {
              setResponse(response.data.assistant_content);
              setChatHistory(prevHistory => [...prevHistory, { role: 'user', content: query }]);
              setChatHistory(prevHistory => [...prevHistory, { role: 'assistant', content: response.data.assistant_content }]);
          })
          .catch(error => {
              console.error('Error sending message:', error);
          });

      setQuery('');
  };

  const [transcript, settranscript] = useState('');

  useEffect(() => {
      const fetchTranscript = () => {
          axios.get('http://127.0.0.1:5000/get_current_transcript')
              .then(response => {
                  settranscript(response.data);
                  console.log(response.data);
              })
              .catch(error => {
                  console.error('There was an error!', error);
              });
      };

      fetchTranscript();
      const intervalId = setInterval(fetchTranscript, 60*1000); // Fetch every 2 minutes

      // Clean up interval on component unmount
      return () => {
          clearInterval(intervalId);
      };
  }, []);



  

  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [doubt, setDoubt] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmitEmail = async (e) => {
      e.preventDefault();
      try {
          const response = await axios.post('http://127.0.0.1:5000/send_email', {
              recipient_email: recipientEmail,
              subject: subject,
              doubt: doubt,
          });
          setSuccessMessage(response.data.message);
          // Reset form fields after successful submission
          setRecipientEmail('');
          setSubject('');
          setDoubt('');
      } catch (error) {
          console.error('Error sending email:', error);
          // Handle error
      }
  };


  const [percentage, setPercentage] = useState(0);
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
      const fetchPercentage = async () => {
          try {
              const response = await axios.get('http://127.0.0.1:5000/get_percentage');
              const data = response.data;
              setPercentage(data.percentage);

              if (data.percentage > 80) {
                  setDifficulty('hard');
              } else if (data.percentage >= 50 && data.percentage <= 80) {
                  setDifficulty('medium');
              } else {
                  setDifficulty('easy');
              }
          } catch (error) {
              console.error('Error fetching percentage:', error);
          }
      };

      const interval = setInterval(() => {
          fetchPercentage();
      }, 10000);

      return () => clearInterval(interval);
  }, []);



  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/generate_image');
        setImageURL(response.data.image_url);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Fetch data immediately when component mounts

    const intervalId = setInterval(fetchData, 30000); // Fetch data every 1 minute (60000 milliseconds)

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);




  





  return (
    <div>



      <br></br>
      <center>
      <h1 className="mb-4 content-center text-3xl font-extrabold text-gray-900 dark:text-red md:text-5xl lg:text-6xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Online Classroom </span> Engagement Enhancer</h1>

      </center>
      <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400"></p>

      <div>
         
      
      <div className='grid grid-cols-2 gap-10'>
        <div className="m-4" >
         

          
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="file_input">Upload file</label>
          <input onChange={handleFileChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="file_input_help" id="file_input" type="file" />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>

         
          
          <video src={playvideo} className="w-full h-auto max-w-full border border-gray-200 rounded-lg dark:border-gray-700" controls>
          </video>
          <br />
          <br />
   
          <button onClick={transcribeVideo} type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Start the Quiz</button>
          
          <div className="max-w-lg mx-auto bg-white rounded-xl overflow-hidden shadow-md p-6">
  <p className="text-xl font-semibold mb-4 ">Summary</p>
  <div className="border-t border-gray-200 overflow-y-auto max-h-80">
    <p className="text-gray-700 pt-4">{transcript}</p>
    <object data="D:\Flask_Apps\Pict-Flask-App\summary_pdf.pdf" type="application/pdf" width="100%" height="100%">
  </object>
  </div>
</div>
<br></br>
<div class="max-w-md mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-md">

<div>

  <h1 class="text-2xl font-bold mb-4">Doubt Assistant</h1>
  <div class="chat-container" style={{ maxHeight: "300px", overflowY: "auto" }}>
    {chatHistory.map((msg, index) => (
      <div key={index} class="mb-2">
        {msg.role === 'User' ? (
          <div class="flex justify-end">
            <div class="bg-blue-500 text-white py-2 px-4 rounded-lg inline-block" style={{ maxWidth: "70%" }}>{msg.content}</div>
          </div>
        ) : (
          <div class="flex justify-start">
            <div class="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg inline-block" style={{ maxWidth: "70%" }}>{msg.content}</div>
          </div>
        )}
      </div>
    ))}
  </div>
  <form onSubmit={handleSubmit} class="flex mt-4">
    <input
      type="text"
      placeholder="Enter your message"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
      style={{ textAlign: "left" }}
    />
    
    <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
      Send
    </button>
  </form>
</div>
</div>



          
          
          
          <br />
         
        </div>
        <div>



        <br></br>

<div>


      {quizData.length > 0 && currentQuestion < quizData.length ? (
        <div className='container mt-8  max-w-md mx-auto relative'>
  <div className='bg-white rounded-lg shadow-md p-6 pb-8'>
    <div className='flex justify-between'>
      <div
        style={{
          backgroundColor: difficulty === 'hard' ? 'red' : (difficulty === 'medium' ? 'purple' : 'green'),
          padding: '10px',
          marginTop: '10px',
          marginBottom: '10px',
          borderRadius: '15px',
          fontSize: '17px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div>{difficulty}</div>
      </div>
      <div
        style={{
          backgroundColor: 'blue',
          padding: '10px',
          marginTop: '10px',
          marginBottom : '10px',
          borderRadius: '15px',
          fontSize: '17px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div>Score : {percentage.toFixed(2)}/100</div>
      </div>
    </div>
    <h2 className='text-xl font-semibold mb-4 text-blue-700'>{quizData[currentQuestion].question}</h2>
    <ul className='space-y-2'>
      {quizData[currentQuestion].options.map((option, index) => (
        <li 
          key={index} 
          className='flex items-center p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors'
        >
          <input
            type="radio"
            name="option"
            value={option}
            checked={selectedOption === option}
            onChange={() => handleOptionSelect(option)}
            className='mr-2 cursor-pointer'
          />
          <span className='text-green-600'>{option}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={handleNextQuestion}
      disabled={!selectedOption}
      className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed'
    >
      Next
    </button>
  </div>



</div>
      
      
      
      
      
      ) : (
        <div className='container px-4 max-w-md  mx-auto'>
        <div className='bg-white rounded-lg shadow-md p-6 pb-8'>
          <h2>Quiz </h2>
          <p>Your Score: {score}/{quizData.length}</p>
          {/* <h3>Correct Answers:</h3> */}
          <ul>
            {quizData.map((question, index) => (
              <li key={index}>
                <strong>Question:</strong> {question.question}
                <br />
                <strong>Correct Answer:</strong> {question.answer}
              </li>
            ))}
          </ul>
        </div>
        </div>      )}
        </div>
        <div className='max-w-lg mx-auto'>
  {imageURL && <img src={imageURL} alt="Generated Image" />}
</div>


<div>
  <br />
  <div>
  <div className="max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-md">
  <div className="px-6 py-4 bg-blue-500 text-white font-bold ">Feedback</div>
  <div className="px-6 py-4">
    {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
    <form onSubmit={handleSubmitEmail} className="space-y-4">
      <div>
        <label htmlFor="recipientEmail" className="block text-gray-700 font-semibold mb-2">Recipient Email:</label>
        <input
          type="email"
          id="recipientEmail"
          className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">Subject:</label>
        <input
          type="text"
          id="subject"
          className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="doubt" className="block text-gray-700 font-semibold mb-2">Doubt/Feedback:</label>
        <textarea
          id="doubt"
          className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
          value={doubt}
          onChange={(e) => setDoubt(e.target.value)}
        />
      </div>
      <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Send Email</button>
    </form>
  </div>
</div>
        </div>



</div>

    
      <br />
      


      


        </div>
        </div>





      </div>
      {/* <input type="file" onChange={handleFileChange}/>
      <h2>Video Player</h2>
      <video src={playvideo} width="800" height="400" controls />
      <br />
      <button onClick={transcribeVideo}>Transcribe</button> */}
      {/* {console.log(quizData)}
      {quizData.length > 0 && currentQuestion < quizData.length ? (
        <div className='container'>
          <h2>{quizData[currentQuestion].question}</h2>
          <ul>
            {quizData[currentQuestion].options.map((option, index) => (
              <li key={index}>
                <label>
                  <input
                    type="radio"
                    name="option"
                    value={option}
                    checked={selectedOption === option}
                    onChange={() => handleOptionSelect(option)}
                  />
                  {option}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={handleNextQuestion} disabled={!selectedOption}>
            Next
          </button>
        </div>
      ) : (
        <div>
          <h2>Quiz Completed!</h2>
          <p>Your Score: {score}/{quizData.length}</p>
          <h3>Correct Answers:</h3>
          <ul>
            {quizData.map((question, index) => (
              <li key={index}>
                <strong>Question:</strong> {question.question}
                <br />
                <strong>Correct Answer:</strong> {question.answer}
              </li>
            ))}
          </ul>
        </div>
      )} */}




      


      

        <div className="flex justify-evenly ...">
    <div>
    <button type="button" onClick={getnotes} class="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Get Notes</button>
        {notes && <pre>{JSON.stringify(notes, null, 2)}</pre>}
    </div>
    <div>
    <button type="button" onClick={getflowchart} class="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Get Flow Chart</button>
        {flowchart && <pre>{JSON.stringify(flowchart, null, 2)}</pre>}
    </div>
    <div>
    <button onClick = {advgetflowchart} type="button" class="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Get Advanced Flow Chart</button>
        {flowchart && <pre>{JSON.stringify(advflowchart, null, 2)}</pre>}
    </div>
    <div>
        <button onClick={() => window.open('http://localhost:5173/graphs', '_blank')} type="button" class="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Engagement Analytics</button>
    </div>

</div>
<br></br>





    </div>
  );

}


export default Home