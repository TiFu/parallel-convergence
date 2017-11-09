#include "replaylink.h"

#include <iostream>
#include <chrono>
#include <thread>

#include <../Patterns/PatternSearch.h>
#include <../Process/Process.h>

#define PROCESS_NAME L"League of Legends.exe"

using namespace blackbone;
using namespace std::chrono_literals;

namespace replay
{
	Process league_process;
	bool attached = false; 
	
	uint32_t camera_object_address = 0;

	camera_impl::camera_impl()
	{
		std::vector<DWORD> t_ProcessList;

		std::wcout << L"Waiting for '" << PROCESS_NAME << L"'." << std::endl;

		// Wait for League of Legends to load
		while (t_ProcessList.empty())
		{
			t_ProcessList = Process::EnumByName(PROCESS_NAME);
			std::this_thread::sleep_for(2ms);
		}

		if (NT_SUCCESS(league_process.Attach(t_ProcessList[0])) == false)
		{
			std::wcerr << L"Error trying to open '" << PROCESS_NAME << L"'." << std::endl;
			return;
		}

		attached = true;
		std::cout << "Trying to find the pattern for the camera object..." << std::endl;

		camera_object_address = 0;
		PatternSearch pattern("\x8B\x0D\xCC\xCC\xCC\xCC\x8B\x49\x24\xE8\xCC\xCC\xCC\xCC\x8B");

		std::vector<ptr_t> results;
		pattern.SearchRemoteWhole(league_process, true, 0xCC, results);

		// Unable to find position offset
		if (results.size() == 0)
		{
			std::cout << "Unable to find the pattern." << std::endl;
			return;
		}

		if (league_process.memory().Read<uint32_t>(results[0] + 2, camera_object_address))
		{
			std::cout << "Failed to read a part of the pattern." << std::endl;
			return;
		}

		if (league_process.memory().Read<uint32_t>(camera_object_address, camera_object_address))
		{
			std::cout << "Failed to read in the multiplayer client." << std::endl;
			return;
		}

		if (league_process.memory().Read<uint32_t>(camera_object_address + 12, camera_object_address))
		{
			std::cout << "Failed to get the camera object." << std::endl;
			return;
		}
	}

	vector2 camera_impl::get_position()
	{
		vector2 t_result(0, 0);
		if (league_process.memory().Read<float>(camera_object_address + 0x12c, t_result.x))
		{
			std::cout << "Failed to read x position of camera." << std::endl;
			return vector2(-1, -1);
		}

		if (league_process.memory().Read<float>(camera_object_address + 0x134, t_result.y))
		{
			std::cout << "Failed to read y position of camera." << std::endl;
			return vector2(-1, -1);
		}

		return t_result;
	}

	void camera_impl::set_position(float x, float y)
	{
		if (league_process.memory().Write<float>(camera_object_address + 0x12c, x))
		{
			std::cout << "Failed to write x position of camera." << std::endl;
			return;
		}

		if (league_process.memory().Write<float>(camera_object_address + 0x134, y))
		{
			std::cout << "Failed to write y position of camera." << std::endl;
			return;
		}
	}

	void camera_impl::set_position(vector2 vec)
	{
		return set_position(vec.x, vec.y);
	}
}

int main()
{
	replay::camera_impl t_camera;
	while (true)
	{
		auto t_vec = t_camera.get_position();

		std::cout << "X = " << t_vec.x << ", Y = " << t_vec.y << std::endl;
		std::this_thread::sleep_for(2ms);
	}
}