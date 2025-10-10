import { Button } from '@shadcn/components/ui/button';
import { Chart, ChartSerie } from '@renderer/components/Chart/Chart';
import { useEffect, useState } from 'react';
import { CustomMenuBar } from '@renderer/components/CustomMenuBar/CustomMenuBar';

export function HomePage() {
  const [data, setData] = useState<ChartSerie[]>([]);

  // const [channelsPanelWidth, setChannelsPanelWidth] = useState(300);
  const [lockYAxis, setLockYAxis] = useState(false);
  const [plotsPerRow, setPlotsPerRow] = useState(2);
  const [showLegend, setShowLegend] = useState(true);
  const [showGridMinor, setShowGridMinor] = useState(false);
  // const [dataFiles, setDataFiles] = useState<[]>([]);
  // const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [shouldAddPlot, setShouldAddPlot] = useState(false);
  console.log(shouldAddPlot);
  async function ping() {
    const response = await window.versions.ping();
    console.log(response);
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await window.uniplot.getChartData();
      setData(response);
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   const sampleData = generateSampleData();
  //   const sampleFiles: DataFile[] = sampleData.map((data) => ({
  //     ...data,
  //     expanded: true,
  //     channels: data.channels.map((channel) => ({
  //       ...channel,
  //       selected: false,
  //     })),
  //   }));
  //   setDataFiles(sampleFiles);
  // }, []);

  const handleFileOpen = async (file: File) => {
    console.log(file);
    // try {
    // const content = await file.text();
    // let parsedData;
    // if (file.name.endsWith('.json')) {
    //   parsedData = await parseJsonFile(file, content);
    // } else if (file.name.endsWith('.out')) {
    //   parsedData = await parseOutFile(file, content);
    // } else {
    //   throw new Error('Unsupported file format. Please use .json or .out files.');
    // }
    //   const newFile: DataFile = {
    //     ...parsedData,
    //     expanded: true,
    //     channels: parsedData.channels.map((channel) => ({
    //       ...channel,
    //       selected: false,
    //     })),
    //   };
    //   setDataFiles((prev) => [...prev, newFile]);
    // } catch (error) {
    //   console.error('Error loading file:', error);
    //   alert(`Error loading file: ${error}`);
    // }
  };

  // const handleChannelToggle = (fileId: string, channelId: string) => {
  //   const channelKey = `${fileId}-${channelId}`;

  //   setSelectedChannels((prev) => {
  //     const newSet = new Set(prev);
  //     if (newSet.has(channelKey)) {
  //       newSet.delete(channelKey);
  //     } else {
  //       newSet.add(channelKey);
  //     }
  //     return newSet;
  //   });
  // };

  const handleAddPlot = () => {
    setShouldAddPlot(true);
  };

  const handleAddPage = () => {
    console.log('Adding new page...');
    // TODO: Implement add page functionality
  };

  // const onPlotAdded = () => {
  //   setShouldAddPlot(false);
  // };

  // const handleActiveChannelsChange = (channels: Set<string>) => {
  //   setSelectedChannels(channels);
  // };

  return (
    <div className="p-4">
      <div className="h-8 bg-menu-bg border-b border-border">
        <CustomMenuBar
          lockYAxis={lockYAxis}
          setLockYAxis={setLockYAxis}
          plotsPerRow={plotsPerRow}
          setPlotsPerRow={setPlotsPerRow}
          showLegend={showLegend}
          setShowLegend={setShowLegend}
          showGridMinor={showGridMinor}
          setShowGridMinor={setShowGridMinor}
          onFileOpen={handleFileOpen}
          onAddPlot={handleAddPlot}
          onAddPage={handleAddPage}
        />
      </div>
      <h1 className="text-3xl font-bold underline">Hello from React!</h1>
      <p>
        This app is using Chrome (v{window.versions.chrome()}), Node.js (v{window.versions.node()}),
        and Electron (v{window.versions.electron()})
      </p>
      <Button onClick={ping}>ping</Button>
      <Chart series={data} />
    </div>
  );
}
