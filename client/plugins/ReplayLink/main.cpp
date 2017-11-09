#include <iostream>
#include <chrono>
#include <thread>

#include <../Process/Process.h>

#define PROCESS_NAME L"League of Legends.exe"

using namespace blackbone;
using namespace std::chrono_literals;

int main() 
{
	std::vector<DWORD> t_ProcessList;

	std::wcout << L"Waiting for '" << PROCESS_NAME << L"'." << std::endl;

	// Wait for League of Legends to load
	while (t_ProcessList.empty())
	{
		t_ProcessList = Process::EnumByName(PROCESS_NAME);
		std::this_thread::sleep_for(2ms);
	}
}