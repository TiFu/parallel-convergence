#include "replaylink.h"
#include "league.h"

namespace replay
{
	namespace internal
	{
		Process league_process;
		bool attached = false;
	}
}

using namespace blackbone;
using namespace std::chrono_literals;

namespace replay
{
	bool connect_to_league()
	{
		if (internal::attached) return true;

		std::vector<DWORD> t_ProcessList;

		std::wcout << L"Waiting for '" << PROCESS_NAME << L"'." << std::endl;

		// Wait for League of Legends to load
		while (t_ProcessList.empty())
		{
			t_ProcessList = Process::EnumByName(PROCESS_NAME);
			std::this_thread::sleep_for(2ms);
		}

		if (NT_SUCCESS(internal::league_process.Attach(t_ProcessList[0])) == false)
		{
			std::wcerr << L"Error trying to open '" << PROCESS_NAME << L"'." << std::endl;
			return false;
		}

		internal::attached = true;
		return true;
	}
}