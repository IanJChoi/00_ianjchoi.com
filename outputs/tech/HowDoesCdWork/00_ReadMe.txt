+---------------------------------------------------------------------------------+
|                              How does "cd" work?                                |
+---------------------------------------------------------------------------------+

I found myself wondering how something I use every day actually works. 
When I use a terminal, I change directories with the cd command all the time. 
But how is "cd" implemented? What really happens under the hood?
I took a closer look.

First, there is an important concept to clarify. 
The terminal itself only receives user input and displays output; it does not 
execute commands. Command execution is handled by a shell process, in this case, 
zsh (Z-Shell).
(I’ll cover how Terminal.app launches the zsh in a future post.)

Let’s say the user types the command "cd projects". The terminal captures the 
input and passes it to zsh. zsh then parses and executes the command, interacting 
with the kernel (XNU) when required.
These posts examines that process in detail—specifically, how zsh handles the 
command after receiving it.

+-----------------------------------fun facts-------------------------------------+
The name zsh comes from “Z Shell”. The “Z” is often said to have been chosen to 
evoke the idea of a “final” or “ultimate” shell, since Z is the last letter of the 
alphabet. If this is incorrect, I would appreciate any clarification.
+---------------------------------------------------------------------------------+
