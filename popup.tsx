import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

async function fetchExamTopic(text, options: { apiKey: string; cx: string }) {
  const result = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${options.apiKey}&cx=${options.cx}&q=\"${text}\"`,
    { method: 'GET', redirect: 'follow'}
  ).then(response => response.json());
  return result.items[0].link;
}

function IndexPopup() {
  const apiKey = process.env.PLASMO_PUBLIC_API_KEY;
  const cx = process.env.PLASMO_PUBLIC_CX;

  const { getValues, setValue, control } = useForm({
    defaultValues: {
      topic: '',
      question: '1'
    }
  });

  useEffect(() => {
    chrome.storage.local.get(['topic'], (t) => {
      console.log(`Topic: ${t.topic}`);
      setValue('topic', t.topic);
    })
    chrome.storage.local.get(['question'], (q) => {
      console.log(`Question: ${q.question}`);
      setValue('question', q.question);
    })
  }, []);
  
  const redirect = (mode: 'NEXT' | 'CUR' | 'PREV') => {
    const topic = getValues('topic');
    let question = parseInt(getValues('question'), 10) || 1;

    switch(mode) {
      case 'NEXT':
        question = question + 1;
        break;
      case 'PREV':
        question = Math.max(question - 1, 1)
        break;
      default:
        break;
    }

    const searchString = topic.replace('*', `${question}`);
    fetchExamTopic(searchString, { apiKey, cx }).then(url => chrome.tabs.update({url}));

    setValue('topic', topic);
    setValue('question', `${question}`);

    chrome.storage.local.set({
      topic,
      question
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        background: "linear-gradient(to top, #BADBFB , #FFFFFF )"
      }}>
        <Box sx={{ mt: 0.5, mb: 0.5}}>
          <Controller
            name={"topic"}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField onChange={onChange} value={value} label={"Topic"} />
            )}
          />
        </Box>

        <Box sx={{ mt: 0.5, mb: 0.5}}>
          <Controller
            name={"question"}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField onChange={onChange} value={value} label={"Question"} />
            )}
          />
        </Box>
        <div style={{
          display: "flex",
          justifyContent: "space-around"
        }}>
          <Button fullWidth onClick={() => redirect('PREV')}>{'<'}</Button>
          <Button fullWidth onClick={() => redirect('CUR')}>{'GO'}</Button>
          <Button fullWidth onClick={() => redirect('NEXT')}>{'>'}</Button>
        </div>
    </div>
  )
}

export default IndexPopup
