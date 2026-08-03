import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Watch,
  Smartphone,
  Battery,
  BatteryMedium,
  BatteryLow,
  Wifi,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Device } from "@/types";

interface DevicePanelProps {
  devices: Device[];
  patientId: string;
  onDeviceAdded?: (device: Device) => void;
}
export const DevicePanel: React.FC<DevicePanelProps> = ({ devices, patientId, onDeviceAdded }) => {
  const [scanning, setScanning] = React.useState(false);
  const [scannedDevices, setScannedDevices] = React.useState<Device[]>([]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/monitor/patients/${patientId}/devices/scan`);
      const data = await res.json();
      setScannedDevices(data);
    } catch (e) {
      console.error(e);
    }
    setScanning(false);
  };

  const handleConnect = async (devName: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/monitor/patients/${patientId}/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_name: devName, device_type: devName })
      });
      const data = await res.json();
      if (onDeviceAdded && data.device) {
        onDeviceAdded(data.device);
      }
      setScannedDevices(prev => prev.filter(d => d.name !== devName));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/monitor/patients/${patientId}/devices/${deviceId}/disconnect`, {
        method: "POST"
      });
      // A quick reload to sync state since we don't have a specific `onDeviceRemoved` callback
      // Or we can just let the polling interval fetch the updated list
    } catch (e) {
      console.error(e);
    }
  };

  const renderBatteryIcon = (level: number) => {
    if (level > 70) return <Battery className="w-4 h-4 text-emerald-500" />;
    if (level > 30) return <BatteryMedium className="w-4 h-4 text-amber-500" />;
    return <BatteryLow className="w-4 h-4 text-red-500 animate-pulse" />;
  };

  const renderSignalIcon = (status: string, strength: number = 100) => {
    if (status === "Disconnected") return <Wifi className="w-3 h-3 text-red-500 opacity-50" />;
    if (strength > 80) return <Wifi className="w-3 h-3 text-emerald-500" />;
    if (strength > 50) return <Wifi className="w-3 h-3 text-amber-500" />;
    return <Wifi className="w-3 h-3 text-red-500" />;
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-none bg-muted/10">
      <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wifi className="w-4 h-4" /> Connected Devices
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleScan} disabled={scanning} className="h-8 text-xs">
          {scanning ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Search className="w-3 h-3 mr-1" />}
          Scan
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        {scannedDevices.length > 0 && (
          <div className="bg-background/50 border-b p-2 space-y-2 max-h-[120px] overflow-y-auto">
            <p className="text-xs text-muted-foreground px-2 font-semibold">DISCOVERED</p>
            {scannedDevices.map(d => (
              <div key={d.id} className="flex items-center justify-between px-2 py-1 bg-background rounded-md text-sm border shadow-sm">
                <span className="truncate flex-1" title={d.name}>{d.name}</span>
                <Button size="sm" variant="secondary" className="h-6 text-xs px-2 ml-2" onClick={() => handleConnect(d.name)}>
                  <Plus className="w-3 h-3 mr-1" /> Pair
                </Button>
              </div>
            ))}
          </div>
        )}
        <ScrollArea className="flex-1">
          {devices?.length > 0 ? (
            <div className="divide-y">
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dev.status === 'Connected' ? 'bg-primary/10' : 'bg-muted'}`}>
                      {dev.type.toLowerCase().includes("watch") ? (
                        <Watch className={`w-4 h-4 ${dev.status === 'Connected' ? 'text-primary' : 'text-muted-foreground'}`} />
                      ) : (
                        <Activity className={`w-4 h-4 ${dev.status === 'Connected' ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{dev.type}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${dev.status === "Connected" ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`}
                        ></span>
                        {dev.status} {dev.status === "Connected" && `• ${dev.last_sync}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs font-medium">
                      {renderBatteryIcon(dev.battery)} {dev.battery}%
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center text-xs text-muted-foreground" title="Signal Strength">
                        {renderSignalIcon(dev.status, dev.signal_strength)}
                      </span>
                      <Button variant="ghost" size="icon" className="w-5 h-5 text-muted-foreground hover:text-red-500" onClick={() => handleDisconnect(dev.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No devices connected
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
