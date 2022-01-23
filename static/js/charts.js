function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
};

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    let metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    let resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    let result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    let PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
};

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    let allSamples = data.samples;
    let allMetadata = data.metadata;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    let sampleArray = allSamples.filter(entry => entry.id === sample);
    let metaArray = allMetadata.filter(entry => entry.id.toString() === sample);
    //  5. Create a variable that holds the first sample in the array.
    let result = sampleArray[0];
    let metaResult = metaArray[0];
    console.log(result);
    console.log(allMetadata);
    console.log(metaArray);
    console.log(metaResult);

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    let microbiomeData = []
    for(i=0;i<result.otu_ids.length;i++){
      let entry = {bact_id: result.otu_ids[i], bact_name:result.otu_labels[i], count_value:result.sample_values[i]};
      microbiomeData.push(entry);
    };
    console.log(microbiomeData);

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    // BAR CHART
    let yticks = microbiomeData.sort((a,b)=> b.count_value-a.count_value).slice(0,10).reverse();
    console.log(yticks);

    let plot1 = yticks.map(bacteria => bacteria.count_value);
    let plot2 = yticks.map(bacteria => "OTU: "+bacteria.bact_id);
    let barText = yticks.map(bacteria => bacteria.bact_name);
    // console.log(plot2);
    // console.log(plot1);

    // 8. Create the trace for the bar chart. 
    var barData = [{x:plot1, y:plot2, text: barText,
    type:"bar",orientation:"h"}];

    // 9. Create the layout for the bar chart. 
    var barLayout = {autosize: true, 
    title:"Top Ten Bacteria in Your Belly Button", 
    xaxis:{title:"Count"},
    yaxis:{title:"Bacteria Species ID", automargin: true},
    hovermode: true
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar",barData,barLayout);

    // BUBBLE CHART:
    // Bubble trace
    let bubbleX = microbiomeData.map(bacteria => bacteria.bact_id);
    let bubbleY = microbiomeData.map(bacteria => bacteria.count_value);
    let bubbleT = microbiomeData.map(bacteria => bacteria.bact_name);

    var bubbleData = [{
      x: bubbleX,
      y: bubbleY,
      text: bubbleT,
      mode: "markers",
      marker:{
        size: bubbleY,
        color: bubbleX,
        colorscale: "YlGnBu"
      }
    }];
    console.log(bubbleData);
    // Bubble layout
    var bubbleLayout = {
      title: "Bacterial Cultures Per Sample",
      xaxis: {title: "OTU ID"},
      yaxis: {title: "Count"},
      hovermode: true,
      showlegend: false};
    
    // Plot Bubble Chart
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    
    // GAUGE:
    // Gauge trace
    let washData = metaResult.wfreq;
    console.log(washData);
    var gaugeData = [{
      value: washData,
      type: "indicator",
      mode: "gauge+number",
      title: {text: "Scrubs per Week"},
      gauge: {
        axis:{range:[0,10],  tickwidth: 2, tickcolor:"#000099", dtick: 2},
        bar:{color:"#0000ff"},
        borderwidth:2,
        bordercolor: "#000000",
        steps:[
        {range:[0,2], color:"#cc0000"},
        {range:[2,4], color:"#ff9933"},
        {range:[4,6], color:"#ffff66"},
        {range:[6,8], color:"#99cc00"},
        {range:[8,10], color:"#009900"}]
      }
    }];

    // // Gauge layout
    var gaugeLayout = {
      title: "Belly Button Wash Frequency",
      width:280,
      height:280,
      margin:{ t: 50, r: 25, l: 25, b: 5},
      paper_bgcolor:"#fff3e6"
    };

    // Plot Gauge
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });
}
