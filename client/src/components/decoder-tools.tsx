import { useState } from "react";
import { CyberpunkPanel } from "@/components/ui/cyberpunk-panel";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { CyberpunkInput } from "@/components/ui/cyberpunk-input";
import { Input } from "@/components/ui/input";

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
        <CyberpunkInput
          placeholder="01001000 01101001"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="text-sm"
        />
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
        <CyberpunkInput
          placeholder="Enter text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="text-sm"
        />
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real implementation, we would use a QR code reader library
    // For the sake of demonstration, we'll just display a simulated result
    setTimeout(() => {
      setOutput('DECODED: "cybernetic_override_982"');
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
        </div>
      </div>
    </CyberpunkPanel>
  );
}
