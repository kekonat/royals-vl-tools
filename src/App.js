import './App.css';
import { Grid, Button, Snackbar, TextField } from '@mui/material';
import React, { useState } from 'react';

function App() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState([]);
  const [shuffled, setShuffled] = useState([]);
  const [nx, setNx] = useState([]);
  const [names, setNames] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const handleClick = () => {
    let parsed = parseInt(text);
    if (isNaN(parsed)) {
      setError('');
      handleNames(text);
    } else if (parsed < 6 ||parsed > 30){
      setError('Please enter a number between 6-30');
    } else {
      setError('');
      handleNumber(parsed);
    }
  }

  const handleNames = (names) => {
    const list = names.trim().split(/[\s,]+/)
    if (list.length < 6 || list.length > 30) {
      setError('Please list between 6-30 names');
      return;
    }
    setNames(list);
    handleNumber(list.length);
  }

  const handleNumber = (bon) => {
    let less = Math.floor(30 / bon); 
    let more = less + 1;
    let moreCount = 30 % bon;
    let lessCount = bon - moreCount;

    let pool = generate2DArray();
    reverseSecondHalf(pool);

    const retval = [];

    for (let bonners = 0; bonners < moreCount; bonners++) {
      const boxes = getBoxes(pool, more);
      if (boxes) {
        console.log('pushing ' + boxes);
        retval.push(boxes);
      } else {
        console.log('break1');
        break;
      }
    }

    for (let bonners = 0; bonners < lessCount; bonners++) {
      const boxes = getBoxes(pool, less);
      if (boxes) {
        console.log('pushing ' + boxes);
        retval.push(boxes);
      } else {
        console.log('break2');
        break;
      }
    }

    // rearrange pool
    let temp = pool[1];
    pool[1] = pool[3];
    pool[3] = temp;

    temp = pool[2];
    pool[2] = pool[4];
    pool[4] = temp;
    
    for (let i = 0; i < pool.length; i++) {
      pool[i].sort();
    }

    pool = pool.flat();

    while (pool.length > 0) {
      const boxes = [];
      for (let i = 0; i < less; i++) {
        boxes.push(pool.shift());
      }
      retval.push(boxes);
    }

    for (let i = 0; i < retval.length; i++) {
      retval[i].sort();
    }

    setResult(retval);
    const shuffled = shuffle(retval);
    setShuffled(shuffled);

    assignNx(shuffled);
  }

  const assignNx = (shuffled) => {
    let copy = [...shuffled];

    const winners = [];

    while (winners.length < 6)
    {
      let priority = getLessBoxes(copy);
      let others = getMoreBoxes(copy);

      while (winners.length < 6 && priority.length) {
        const index = Math.floor(Math.random()*priority.length);
        const val = priority.splice(index, 1);
        winners.push(val);
      }
      
      while (winners.length < 6 && others.length) {
        const index = Math.floor(Math.random()*others.length);
        const val = others.splice(index, 1);
        winners.push(val);
      }
    }

    const dict = {};
    for (let i = 0; i < shuffled.length; i++) {
      dict[i] = 0;
    }

    const shuffledToString = shuffled.map(row => row.toString());

    for (let i = 0; i < winners.length; i++) {
      const index = shuffledToString.indexOf(winners[i].toString());
      dict[index]++;
    }

    const nxAssignment = [];
    for (let i = 0; i < shuffled.length; i++) {
      nxAssignment.push(dict[i]);
    }
    setNx(nxAssignment);
  }

  const getLessBoxes = (results) => {
    const copy = [...results];
    copy.sort((a, b) => a.length - b.length);
    const shortLength = copy[0].length;
    return copy.filter(row => row.length === shortLength);
  }

  const getMoreBoxes = (results) => {
    const copy = [...results];
    copy.sort((a, b) => b.length - a.length);
    const longerLength = copy[0].length;
    return copy.filter(row => row.length === longerLength);
  }

  const getBoxes = (pool, boxes) => {
    const retval = [];
    // search all rows
    for (let row = 0; row < pool.length; row++) {
      // if this row has enough
      if (pool[row].length >= boxes) {
        // take them
        for (let count = 0; count < boxes; count++) {
          retval.push(pool[row].shift());
        }
        return retval;
      }
    }
    return null;
  }

  const generate2DArray = () => {
    const retval = [];
    const rows = ['a','c','e','b','d','f']
    for (let row = 0; row < rows.length; row++) {
      const arr = [];
      for (let box = 1; box <= 5; box ++) {
        arr.push(`${rows[row]}${box}`)
      }
      retval.push(arr);
    }
    return retval;
  }

  const reverseSecondHalf = (data) => {
    data[3] = data[3].reverse();
    data[4] = data[4].reverse();
    data[5] = data[5].reverse();
  }

  const shuffle = (original) => {
    const array = [...original];
    let currentIndex = array.length, randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  return (
    <div className="App" >
      <header className="App-header">
        { result.length && !error ? (
          <p>
            {result.length}-man bon
          </p>
        ) : (
          <p>
            Please specify a number or list names of bonners
          </p>
        )}
        <Grid container justifyContent="center">
          <Grid sx={{ backgroundColor: 'white', borderRadius: '5px'}}>
            <TextField 
              inputProps={{style: { textAlign: 'center' }}}
              id="outlined-basic" 
              variant="outlined" 
              onChange={event => setText(event.target.value) }
              multiline
              maxRows={5}
            />
          </Grid>
          <Grid sx={{ borderRadius: '5px', width: '100%'}}>
            <p>{error}</p>
          </Grid>
          <Grid container rowSpacing={1}>
            <Grid item container justifyContent="center">
              <Button 
                type="submit" 
                onClick={handleClick}
                variant="outlined"
              >
                  Generate
              </Button>        
            </Grid>
            { !error && result.length ? (
              <Grid item container justifyContent="center" columnSpacing={1}>
                <Grid item>
                  <Button 
                    type="submit" 
                    onClick={() => {
                      setOpenSnackbar(true)
                      const assignments = [];
                      for (let i = 0; i < shuffled.length; i++) {
                        assignments.push(`${names[i]}:\t${shuffled[i]}`);
                      }

                      navigator.clipboard.writeText(assignments.join("\n"));
                    }}
                    variant="outlined"
                  >
                    Copy Bon
                  </Button>        
                </Grid>
                <Grid item>
                  <Button 
                    type="submit" 
                    onClick={() => {
                      setOpenSnackbar(true)
                      const winners = [];
                      for (let i = 0; i < nx.length; i++) {
                        const count = nx[i];
                        if (count === 1) {
                          winners.push(`${names[i]}`);
                        } else if (count > 1) {
                          winners.push(`${names[i]}x${count}`);
                        }
                      }

                      navigator.clipboard.writeText(winners.join(", "));
                    }}
                    variant="outlined"
                  >
                    Copy NX
                  </Button>        
                </Grid>
                <Snackbar
                  open={openSnackbar}
                  onClose={() => setOpenSnackbar(false)}
                  autoHideDuration={2000}
                  message="Copied to clipboard"
                />
              </Grid>
            ) : (
              <Grid />
            )}
          </Grid>

          { !error && result.length ? (
            <Grid container sx={{ width: '100%', marginTop: '10px'}}>
              <Grid sm={4}>
                <Grid sm={12} textAlign={'center'}>
                  <h>Ordered</h>
                </Grid>
                <Grid sm={12} textAlign={'center'} sx={{ color: 'rgba(52, 52, 52, 0)'}}>
                  <h>placeholder</h>
                </Grid>
                <Grid sm={12} textAlign={'center'}>
                  <p style={{ whiteSpace: "pre-wrap" }}>
                    {
                      result.join("\n")
                    }
                  </p>              
                </Grid>
              </Grid>
              <Grid container sm={8}>
                <Grid sm={12} textAlign={'center'}>
                  <h>Randomized</h>
                </Grid>
                <Grid container sm={12}>
                  <Grid sm={names.length ? 3 : 9}>
                    <Grid sm={12} textAlign={'center'}>
                      <h>Runner</h>
                    </Grid>
                    <Grid sm={12} textAlign={'center'}>
                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {
                          names.join("\n")
                        }
                      </p>
                    </Grid>
                  </Grid>
                  <Grid sm={names.length ? 6 : 0}>
                    <Grid sm={12} textAlign={'center'}>
                      <h>Boxes</h>
                    </Grid>
                    <Grid sm={12} textAlign={'center'}>
                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {
                          shuffled.join("\n")
                        }
                      </p>
                    </Grid>
                  </Grid>
                  <Grid sm={names.length ? 3 : 3}>
                    <Grid sm={12} textAlign={'center'}>
                      <h>NX</h>
                    </Grid>
                    <Grid sm={12} textAlign={'center'}>
                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {
                          nx.join("\n")
                        }
                      </p>
                    </Grid>           
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Grid />
          )}
        </Grid>
      </header>
    </div>
  );
}

export default App;
