import { useState } from "react";
import { Camera } from "lucide-react";
import { CyberpunkPanel } from "@/components/ui/cyberpunk-panel";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { CyberpunkInput } from "@/components/ui/cyberpunk-input";
import { Input } from "@/components/ui/input";
import { WebcamCapture } from "@/components/webcam-capture";

export function DecoderTools() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-t border-neon-blue/30 p-4">
      <CyberpunkButton 
        variant="default" 
        fullWidth 
        className="mb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{isOpen ? "HIDE DECODER TOOLS" : "SHOW DECODER TOOLS"}</span>
      </CyberpunkButton>
      
      {isOpen && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BinaryDecoder />
            <CaesarCipher />
            <MorseCodeReference />
            <QRCodeScanner />
          </div>
        </div>
      )}
    </div>
  );
}

function BinaryDecoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("[OUTPUT WILL APPEAR HERE]");
  const [showCamera, setShowCamera] = useState(false);
  
  const handleImageCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Prefer back camera
        audio: false 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0);
      
      // Stop camera after capture
      stream.getTracks().forEach(track => track.stop());
      
      // For demo, using sample binary. In production, would use OCR
      setInput("01001000 01100101 01101100 01101100 01101111");
      setShowCamera(false);
    } catch (error) {
      console.error('Failed to access camera:', error);
      toast({
        title: "Camera Error",
        description: "Please grant camera permissions to use this feature.",
        variant: "destructive"
      });
    }
  };
  
  const handleDecode = () => {
    try {
      // Split by spaces and convert each binary group to a character
      const result = input.split(' ').map(bin => {
        return String.fromCharCode(parseInt(bin, 2));
      }).join('');
      
      setOutput(result);
    } catch (e) {
      setOutput('ERROR: INVALID BINARY FORMAT');
    }
  };
  
  return (
    <CyberpunkPanel className="p-3">
      <h3 className="font-orbitron text-neon-green text-sm mb-2">BINARY DECODER</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex gap-2">
          <CyberpunkInput
            placeholder="01001000 01101001"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="text-sm flex-1"
          />
          <CyberpunkButton
            variant="accent"
            size="sm"
            onClick={() => setShowCamera(true)}
            className="text-sm"
          >
            <Camera className="h-4 w-4" />
          </CyberpunkButton>
        </div>
        {showCamera && (
          <div className="mt-2">
            <WebcamCapture
              onCapture={handleImageCapture}
              onClose={() => setShowCamera(false)}
            />
          </div>
        )}
        <CyberpunkButton 
          variant="accent" 
          size="sm" 
          onClick={handleDecode}
          className="text-sm"
        >
          DECODE
        </CyberpunkButton>
        <div className="terminal-output text-sm p-2 font-tech-mono bg-cyber-black/80 border border-neon-blue/30 rounded-sm text-steel-blue">
          {output}
        </div>
      </div>
    </CyberpunkPanel>
  );
}

function CaesarCipher() {
  const [input, setInput] = useState("");
  const [shift, setShift] = useState(3);
  const [output, setOutput] = useState("[OUTPUT WILL APPEAR HERE]");
  const [showCamera, setShowCamera] = useState(false);
  
  const handleImageCapture = async (imageData: string) => {
    try {
      // Here we would integrate with OCR API to extract text
      // For now, simulating OCR with sample text
      setInput("KHOOR");
      setShowCamera(false);
    } catch (error) {
      console.error('Failed to process image:', error);
    }
  };
  
  const handleDecode = () => {
    try {
      const result = input.split('').map(char => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const isUpperCase = code >= 65 && code <= 90;
          const base = isUpperCase ? 65 : 97;
          
          // Decode by shifting in the opposite direction
          return String.fromCharCode(
            ((code - base - shift + 26) % 26) + base
          );
        }
        return char;
      }).join('');
      
      setOutput(result);
    } catch (e) {
      setOutput('ERROR: DECODING FAILED');
    }
  };
  
  return (
    <CyberpunkPanel className="p-3">
      <h3 className="font-orbitron text-neon-green text-sm mb-2">CAESAR CIPHER</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex gap-2">
          <CyberpunkInput
            placeholder="Enter text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="text-sm flex-1"
          />
          <CyberpunkButton
            variant="accent"
            size="sm"
            onClick={() => setShowCamera(true)}
            className="text-sm"
          >
            <Camera className="h-4 w-4" />
          </CyberpunkButton>
        </div>
        {showCamera && (
          <div className="mt-2">
            <WebcamCapture
              onCapture={handleImageCapture}
              onClose={() => setShowCamera(false)}
            />
          </div>
        )}
        <div className="flex gap-2">
          <CyberpunkInput
            type="number"
            placeholder="Shift"
            className="text-sm w-16"
            min={1}
            max={25}
            value={shift}
            onChange={(e) => setShift(parseInt(e.target.value) || 3)}
          />
          <CyberpunkButton 
            variant="accent" 
            size="sm" 
            onClick={handleDecode}
            className="text-sm flex-1"
          >
            DECODE
          </CyberpunkButton>
        </div>
        <div className="terminal-output text-sm p-2 font-tech-mono bg-cyber-black/80 border border-neon-blue/30 rounded-sm text-steel-blue">
          {output}
        </div>
      </div>
    </CyberpunkPanel>
  );
}

function MorseCodeReference() {
  return (
    <CyberpunkPanel className="p-3">
      <h3 className="font-orbitron text-neon-green text-sm mb-2">MORSE CODE REFERENCE</h3>
      <div className="terminal-output text-xs p-2 max-h-32 overflow-y-auto font-tech-mono bg-cyber-black/80 border border-neon-blue/30 rounded-sm text-steel-blue whitespace-pre">
{`A: .-    B: -...  C: -.-.  D: -..   E: .     F: ..-.
G: --.   H: ....  I: ..    J: .---  K: -.-   L: .-..
M: --    N: -.    O: ---   P: .--.  Q: --.-  R: .-.
S: ...   T: -     U: ..-   V: ...-  W: .--   X: -..-
Y: -.--  Z: --..  0: ----- 1: .---- 2: ..--- 3: ...--
4: ....- 5: ..... 6: -.... 7: --... 8: ---.. 9: ----.`}
      </div>
    </CyberpunkPanel>
  );
}

function QRCodeScanner() {
  const [output, setOutput] = useState("[QR CONTENT WILL APPEAR HERE]");
  const [isImage, setIsImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isLink, setIsLink] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset states
    setIsImage(false);
    setImageUrl("");
    setIsLink(false);
    
    // In a real implementation, we would use a QR code reader library
    // For the sake of demonstration, we'll simulate different content types
    setTimeout(() => {
      // Simulate different types of QR content
      const demoContents = [
        { type: 'text', content: 'cybernetic_override_982' },
        { type: 'image', content: '/challenge-images/qr-reward.jpg' },
        { type: 'link', content: '/challenges/bonus' }
      ];
      
      const randomContent = demoContents[Math.floor(Math.random() * demoContents.length)];
      
      if (randomContent.type === 'image') {
        setIsImage(true);
        setImageUrl(randomContent.content);
        setOutput(`DECODED: Image detected`);
      } else if (randomContent.type === 'link') {
        setIsLink(true);
        setOutput(`DECODED: "${randomContent.content}"`);
      } else {
        setOutput(`DECODED: "${randomContent.content}"`);
      }
    }, 500);
  };
  
  return (
    <CyberpunkPanel className="p-3">
      <h3 className="font-orbitron text-neon-green text-sm mb-2">QR CODE SCANNER</h3>
      <p className="font-tech-mono text-sm text-steel-blue mb-2">Upload a QR code image to decode</p>
      <div className="flex flex-col space-y-2">
        <Input 
          type="file"
          id="qr-file-input"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        <CyberpunkButton 
          variant="accent" 
          size="sm"
          onClick={() => document.getElementById('qr-file-input')?.click()}
          className="text-sm"
        >
          UPLOAD QR CODE
        </CyberpunkButton>
        <div className="terminal-output text-sm p-2 font-tech-mono bg-cyber-black/80 border border-neon-blue/30 rounded-sm text-steel-blue">
          {output}
          {isImage && (
            <div className="mt-2">
              <img src={imageUrl} alt="QR Code Content" className="max-w-full h-auto rounded" />
            </div>
          )}
          {isLink && (
            <div className="mt-2">
              <CyberpunkButton
                variant="accent"
                size="sm"
                onClick={() => window.location.href = output.slice(9, -1)}
                className="text-sm w-full"
              >
                FOLLOW LINK
              </CyberpunkButton>
            </div>
          )}
        </div>
      </div>
    </CyberpunkPanel>
  );
}
