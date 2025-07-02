import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { SlashCommandMenu } from "./SlashCommandMenu";

const SAMPLE_SCRIPT = `# ExampleCo Home Solutions – Sample Call Script

You're a customer service representative speaking on the phone.

---

## Steps:

1. Ask for **first and last name**.

2. Ask for **full property address**.

3. Confirm the address back, saying:
   - Street numbers and ZIP code individually.
   - e.g., "401st Street" → _"four hundred first street"_

4. Ask:  
   _"And that is the home you own and live at?"_

5. Ask:  
   _"And what type of home is it — single family, condo, townhome, mobile, or rental?"_

6. Ask:  
   _"Great! We also ask to meet with all owners of the property. Who would that be?"_

7. Say:  
   _"This will be a full replacement including frame and installation. We don't perform repairs or glass-only replacements."_

8. Ask how many **[units]** they want replaced (e.g., windows or doors).

9. Ask what issues they're experiencing with those **[units]**.

10. Say:  
    _"A Project Specialist will inspect, measure, and provide a quote valid for 12 months. Does that sound helpful?"_

11. Ask:  
    _"We ask that you set aside about 90 minutes for the visit. Fair enough?"_

12. Ask for **best email address**.

13. Ask:  
    _"Would daytime or evening work better for your schedule?"_

14. Offer appointment based on their preference (e.g., 2 P M or 6 P M).

15. Then:  
    <% function abc12345-def6-7890-ghij-klmnopqrstuv %>

---

## If Caller Is Not Interested:

End with:  
<% function xyz98765-wxyz-4321-lmno-pqrstuvwxyza %>`;

// Constants for better maintainability
const FUNCTION_PLACEHOLDER_PATTERN = '<% function {id} %>';
const SLASH_MENU_POSITION = { top: 50, left: 20 };

export function Editor() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [content, setContent] = useState(SAMPLE_SCRIPT);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createFunctionRegex = useCallback((id: string) => 
    new RegExp(`<% function ${id} %>`, "g"), []);

  const handleUpdateFunction = useCallback((oldId: string, newId: string) => {
    setContent(prev => prev.replace(
      createFunctionRegex(oldId), 
      FUNCTION_PLACEHOLDER_PATTERN.replace('{id}', newId)
    ));
  }, [createFunctionRegex]);

  const handleDeleteFunction = useCallback((id: string) => {
    setContent(prev => prev.replace(createFunctionRegex(id), ""));
  }, [createFunctionRegex]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Detect slash command
    if (newContent.length > content.length && newContent[cursorPos - 1] === '/') {
      setShowSlashMenu(true);
      setCursorPosition(cursorPos);
    }
    
    setContent(newContent);
  }, [content.length]);

  const handleSelectFunction = useCallback((functionId: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Insert function placeholder at cursor position
    const beforeSlash = content.substring(0, cursorPosition - 1);
    const afterSlash = content.substring(cursorPosition);
    const placeholder = FUNCTION_PLACEHOLDER_PATTERN.replace('{id}', functionId);
    const newContent = `${beforeSlash}${placeholder}${afterSlash}`;
    
    setContent(newContent);
    setShowSlashMenu(false);
    
    // Restore focus and cursor position
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = beforeSlash.length + placeholder.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  }, [content, cursorPosition]);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
    setShowSlashMenu(false); // Close menu when switching modes
  }, []);

  return (
    <Card className="rounded-lg shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Script Editor</h2>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">
              Mode: {isEditMode ? "Edit" : "Preview"}
            </span>
            <Button
              onClick={toggleEditMode}
              variant="outline"
              size="sm"
            >
              {isEditMode ? "Preview" : "Edit"}
            </Button>
          </div>
        </div>
        
        {isEditMode ? (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextChange}
              className="min-h-[400px] w-full p-4 font-mono text-sm border rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              aria-label="Markdown editor"
            />
            {showSlashMenu && (
              <SlashCommandMenu
                position={SLASH_MENU_POSITION}
                onSelect={handleSelectFunction}
                onClose={() => setShowSlashMenu(false)}
              />
            )}
          </div>
        ) : (
          <div className="min-h-[400px] w-full">
            <MarkdownRenderer
              content={content}
              onUpdateFunction={handleUpdateFunction}
              onDeleteFunction={handleDeleteFunction}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}