import './App.css';
import { Grid, Button, Snackbar, TextareaAutosize } from '@mui/material';
import React, { useState } from 'react';
import officialBonImage from './official_bon_map.png';

function App() {
  const [bonTextArea, setBonTextArea] = useState('');
  const [bonNames, setBonNames] = useState([]);
  const [sortedBoxGroups, setSortedBoxGroups] = useState([]);
  const [randomBoxGroups, setRandomBoxGroups] = useState([]);

  const [beltTextArea, setBeltTextArea] = useState([]);
  const [beltAssignment, setBeltAssignment] = useState([]);

  const [raffleWinner, setRaffleWinner] = useState([]);
  const [nx, setNx] = useState([]);

  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false)
 
  const handleClick = () => {
    setBonNames([]);
    setBeltAssignment([]);
    setNx([]);
    setError('');

    let bonNames = parseBonNames(bonTextArea);
    if (bonNames === null) {
      return;
    }

    let { winners: bonWinners, losers: bonLosers } = assignBon(bonNames);

    let beltNames = parseBeltNames(beltTextArea);
    let { winners: beltWinners, losers: beltLosers} = assignBelts(beltNames);

    let winners = bonWinners.concat(beltWinners);
    let losers = bonLosers.concat(beltLosers);

    let raffleWinner = assignRaffle(losers);
    winners.push(raffleWinner);
    losers = losers.filter(candidate => candidate !== raffleWinner);

    assignNx(winners, losers);
  }

  const parseBonNames = (bonTextArea) => {
    const names = bonTextArea.trim().split(/[\s,]+/)
    if (names.length < 6 || names.length > 30) {
      setError('Please list between 6-30 names');
      return null;
    }
    setBonNames(names);
    return names;
  }

  const parseBeltNames = (beltTextArea) => {
    if (!beltTextArea || beltTextArea.length === 0) {
      return [];
    }
    const trimmed = beltTextArea.trim();
    if (trimmed.length === 0) {
      return [];
    }
    return trimmed.split(/[\s,]+/);
  }

  const assignRaffle = (candidates) => {
    const index = Math.floor(Math.random() * candidates.length);
    const raffleWinner = candidates[index];
    setRaffleWinner(raffleWinner);
    return raffleWinner;
  }

  const assignBelts = (names) => {
    const belters = names.length;
    let winners = [];

    let moreCount = 6 % belters;
    let beltsForLosers = Math.floor(6 / belters);
    let beltsForWinners = beltsForLosers + 1;

    for (let i = 0; i < moreCount; i++) {
      const index = Math.floor(Math.random() * names.length);
      const removed = names.splice(index, 1);
      const val = removed[0];
      winners.push(val);    
    }

    let losers = names;

    let results = [];
    for (let i = 0; i < winners.length; i++) {
      for (let j = 0; j < beltsForWinners; j++) {
        results.push(winners[i]);
      }
    }

    for (let i = 0; i < losers.length; i++) {
      for (let j = 0; j < beltsForLosers; j++) {
        results.push(losers[i]);
      }
    }

    setBeltAssignment(results);

    return {
      winners,
      losers
    };
  }

  const assignBon = (bonNames) => {
    const numBon = bonNames.length;
    
    const boxGroups = calculateBoxGroups(numBon);
    setSortedBoxGroups(boxGroups);

    let shuffled = [];
    let winnersCount = 30 % numBon;

    let indexes = [];
    for (let i = 0; i < numBon; i++) {
      indexes.push(i);
      shuffled.push(null);
    }

    let winners = [];
    for (let i = 0; i < winnersCount; i++) {
      const index = Math.floor(Math.random()*indexes.length);
      let removed = indexes.splice(index, 1);
      let val = removed[0];
      winners.push(bonNames[val]);
      shuffled[val] = boxGroups[i];
    }

    let losers = [];
    for (let i = winnersCount; i < numBon; i ++) {
      const index = Math.floor(Math.random()*indexes.length);
      let removed = indexes.splice(index, 1);
      let val = removed[0];
      losers.push(bonNames[val]);
      shuffled[val] = boxGroups[i];
    }

    setRandomBoxGroups(shuffled);

    return { winners, losers };
  }

  const calculateBoxGroups = (numBon) => {
    let less = Math.floor(30 / numBon); 
    let more = less + 1;
    let moreCount = 30 % numBon;
    let lessCount = numBon - moreCount;

    let pool = generate2DArray();
    reverseSecondHalf(pool);

    const retval = [];

    for (; moreCount > 0; moreCount--) {
      const boxes = getBoxes(pool, more);
      if (boxes) {
        retval.push(boxes);
      } else {
        break;
      }
    }

    for (; lessCount > 0; lessCount--) {
      const boxes = getBoxes(pool, less);
      if (boxes) {
        retval.push(boxes);
      } else {
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

    while (moreCount > 0) {
      const boxes = [];
      for (let i = 0; i < more; i++) {
        boxes.push(pool.shift());
      }
      retval.push(boxes);
      moreCount--;
    }

    while (lessCount > 0) {
      const boxes = [];
      for (let i = 0; i < less; i++) {
        boxes.push(pool.shift());
      }
      retval.push(boxes);
      lessCount--;
    }

    for (let i = 0; i < retval.length; i++) {
      retval[i].sort();
    }

    return retval;
  }

  const assignNx = (winners, losers) => {
    let nxWinners = [];

    while (nxWinners.length < 6)
    {
      let candidates = losers.length ? losers : winners;
      const index = Math.floor(Math.random()*candidates.length);
      const val = candidates.splice(index, 1);
      nxWinners.push(val[0]);
    }

    setNx(nxWinners);
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

  const onCopy = () => {
    const longestNameLength = Math.max(...(bonNames.map(name => name.length)));
    const max = Math.max(longestNameLength, "Raffle:".length);
    const withPadding = max + 2;

    let data = 
    beltAssignment.length ? [
      bonToString(withPadding), 
      beltToString(withPadding), 
      nxToString(withPadding),
      raffleToString(withPadding)
    ] : [
      bonToString(withPadding), 
      nxToString(withPadding),
      raffleToString(withPadding)
    ]

    let toString = "```\n" + data.join("\n\n") + "\n```\n"
    navigator.clipboard.writeText(toString);
  }

  const bonToString = (length) => {
    const assignments = [];

    for (let i = 0; i < randomBoxGroups.length; i++) {
      if (bonNames.length) {
        const nameWithPadding = bonNames[i].padEnd(length, ' ');
        assignments.push(`${nameWithPadding}${randomBoxGroups[i]}`);
      } else {
        assignments.push(randomBoxGroups[i]);
      }
    }

    return "Bon:\n" + assignments.join("\n")
  }

  const beltToString = (length) => {
    const prefix = "Belts:".padEnd(length, ' ');
    return prefix + beltAssignment.join(" ");
  }

  const nxToString = (length) => {
    const prefix = "NX:".padEnd(length, ' ');
    return prefix + nx.join(" ");
  }

  const raffleToString = (length) => {
    const prefix = "Raffle:".padEnd(length, ' ');
    return prefix + raffleWinner;
  }

  return (
    <Grid className="App" >
      <header className="App-header" >
        <Grid paddingLeft ={'20px'} paddingRight={'20px'}>
          <Grid container justifyContent="center" maxWidth={'1200px'}>
            <Grid item xs={12}>
              <p style={{ margin: '10px'}}>
                List names of bonners
                <br/>
                <small>
                <small>
                <small>
                (Example Names: Cody Clem Jae Harley Alice Em Kuro)
                </small>
                </small>
                </small>
              </p>
            </Grid>
            <Grid item xs={12}>
              <TextareaAutosize 
                inputProps={{style: { textAlign: 'center' }}}
                id="outlined-basic" 
                variant="outlined" 
                onChange={event => setBonTextArea(event.target.value) }
                multiline
                minRows={3}
                classes={{notchedOutline: {
                  noBorder: {
                    border: "none",
                  },
                }}}
              />
            </Grid>
            <Grid item xs={12}>
              <p style={{ margin: '10px'}}>
                List names of belt looters
              </p>
            </Grid>
            <Grid item xs={12}>
              <TextareaAutosize 
                inputProps={{style: { textAlign: 'center' }}}
                id="outlined-basic" 
                variant="outlined" 
                onChange={event => setBeltTextArea(event.target.value) }
                multiline
                minRows={2}
                classes={{notchedOutline: {
                  noBorder: {
                    border: "none",
                  },
                }}}
              />
            </Grid>
            {
              error.length ? (
                <Grid sx={{ borderRadius: '5px', width: '100%', color: 'red'}}>
                  <p>{error}</p>
                </Grid>
              ) : (
                <Grid />
              )
            }
            
            <Grid container rowSpacing={1}>
              <Grid item container justifyContent="center">
                <Button 
                  type="submit" 
                  onClick={handleClick}
                  variant="outlined"
                  sx={{color: 'white', borderColor: 'white'}}
                >
                    Generate
                </Button>        
              </Grid>
            </Grid>

            { !error && sortedBoxGroups.length ? (
              <Grid container sx={{ width: '100%', marginTop: '10px'}} justifyContent={'center'} spacing={1}>
                <Grid item xs={12}>
                  <p style={{ margin: '10px'}}>
                    {sortedBoxGroups.length}-man bon
                  </p>
                </Grid>
                <Grid 
                  item 
                  container 
                  xs={4} 
                  justifyContent={'center'}
                >
                  <Grid 
                    container 
                    sx={{ 
                      width: '100%', 
                      border: "1px solid lightgray",
                      borderRadius: "5px"
                    }} 
                  >
                    <Grid item xs={12} textAlign={'center'}>
                      <h4 style={{ margin: '0px', marginTop: '10px'}}>Ordered Bon</h4>
                    </Grid>
                    <Grid item container xs={12}>
                      <Grid item xs={12}>
                        <Grid item xs={12} textAlign={'center'}>
                          <h5 style={{ margin: '10px' }}>Boxes</h5>
                        </Grid>
                        <Grid item xs={12} textAlign={'center'}>
                          <p style={{ whiteSpace: "pre-wrap", margin: '10px' }}>
                          {
                            sortedBoxGroups.join("\n")
                          }
                          </p>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid 
                  item 
                  container 
                  xs={8}
                  textAlign={'center'}
                  justifyContent={'center'}
                >
                  <Grid 
                    container 
                    justifyContent={'center'}
                    sx={{ 
                      border: "1px solid lightgray",
                      borderRadius: "5px"
                    }} 
                  >
                    <Grid item xs={12} textAlign={'center'}>
                      <h4 style={{ margin: '0px', marginTop: '10px'}}>Random Bon</h4>
                    </Grid>
                    <Grid item container xs={12}>
                      <Grid item xs={6}>
                        <Grid item xs={12} textAlign={'center'}>
                          <h5 style={{ margin: '10px' }}>IGN</h5>
                        </Grid>
                        <Grid item xs={12} textAlign={'center'}>
                          <p style={{ whiteSpace: "pre-wrap", margin: '10px' }}>
                            {
                              bonNames.join("\n")
                            }
                          </p>
                        </Grid>
                      </Grid>
                      <Grid item xs={6}>
                        <Grid item xs={12} textAlign={'center'}>
                          <h5 style={{ margin: '10px' }}>Boxes</h5>
                        </Grid>
                        <Grid item xs={12} textAlign={'center'}>
                          <p style={{ whiteSpace: "pre-wrap", margin: '10px' }}>
                            {
                              randomBoxGroups.join("\n")
                            }
                          </p>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                { beltAssignment.length ? (
                  <Grid 
                    item 
                    container 
                    xs={4}
                    textAlign={'center'}
                    justifyContent={'center'}
                  >
                    <Grid 
                      container 
                      justifyContent={'center'}
                      sx={{ 
                        border: "1px solid lightgray",
                        borderRadius: "5px"
                      }} 
                    >
                      <Grid item xs={12} textAlign={'center'}>
                        <h4 style={{ margin: '0px', marginTop: '10px'}}>Belts</h4>
                      </Grid>
                      <Grid item container xs={12}>
                        <Grid item xs={12} textAlign={'center'}>
                          <p style={{ whiteSpace: "pre-wrap", margin: '10px' }}>
                            {
                              beltAssignment.join("\n")
                            }
                          </p>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid></Grid>
                )}
                

                <Grid 
                  item 
                  container 
                  xs={ beltAssignment.length ? 4 : 6}
                  textAlign={'center'}
                  justifyContent={'center'}
                >
                  <Grid 
                    container 
                    justifyContent={'center'}
                    sx={{ 
                      border: "1px solid lightgray",
                      borderRadius: "5px"
                    }} 
                  >
                    <Grid item xs={12} textAlign={'center'}>
                      <h4 style={{ margin: '0px', marginTop: '10px'}}>NX</h4>
                    </Grid>
                    <Grid item container xs={12}>
                      <Grid item xs={12} textAlign={'center'}>
                        <p style={{ whiteSpace: "pre-wrap", margin: '10px' }}>
                          {
                            nx.join("\n")
                          }
                        </p>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid 
                  item 
                  container 
                  xs={ beltAssignment.length ? 4 : 6}
                  textAlign={'center'}
                  justifyContent={'center'}
                >
                  <Grid 
                    container 
                    justifyContent={'center'}
                    sx={{ 
                      border: "1px solid lightgray",
                      borderRadius: "5px"
                    }} 
                  >
                    <Grid item xs={12} textAlign={'center'}>
                      <h4 style={{ margin: '0px', marginTop: '10px'}}>Raffle</h4>
                    </Grid>
                    <Grid item container xs={12}>
                      <Grid item xs={12} textAlign={'center'}>
                        <p style={{ whiteSpace: "pre-wrap", margin: '10px' }}>
                          {raffleWinner}
                        </p>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item marginTop={'10px'} xs={12}>
                  <Button 
                    type="submit" 
                    sx={{color: 'white', borderColor: 'white'}}
                    onClick={() => {
                      setOpenSnackbar(true)
                      onCopy();
                    }}
                    variant="outlined"
                  >
                    Copy
                  </Button>        
                </Grid>

                <Grid 
                  container 
                  item 
                  minWidth={'300px'}
                  minHeight={'200px'} 
                  maxWidth={'1200px'} 
                  maxHight={'700px'} 
                  marginTop={'10px'}
                  marginBottom={'10px'}
                >
                  <img src={officialBonImage} alt="logo" style={{objectFit: 'contain', width: '100%', height: '100%'}} />
                </Grid>
              </Grid>
            ) : (
              <Grid />
            )}
          </Grid>
        </Grid>
        <Snackbar
          open={openSnackbar}
          onClose={() => setOpenSnackbar(false)}
          autoHideDuration={2000}
          message="Copied to clipboard"
        />
      </header>
    </Grid>
  );
}
export default App;
